"use client";

import { useUser } from "@clerk/nextjs";
import Wrapper from "../components/Wrapper";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { addBudget, getBudgetsByUser } from "../actions";
import Notification from "../components/Notification";
import { Budget } from "@/type";
import Link from "next/link";
import BudgetItem from "../components/BudgetItem";
import { Landmark } from "lucide-react";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false, // désactive le rendu côté serveur
});

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [notification, setNotification] = useState<string>("");
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const closeNotification = () => {
    setNotification("");
  };

  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    setSelectedEmoji(emojiObject.emoji);
    setShowEmojiPicker(false);
  };
  const handleAddBudget = async () => {
    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Le montant doit être positif");
      }
      await addBudget(email as string, budgetName, amount, selectedEmoji);
      fetchBudgets();
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      setNotification("Nouveau budget crée avec succès!");
      setBudgetName("");
      setBudgetAmount("");
      setSelectedEmoji("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.log(error);
      setNotification(`Erreur: ${error}`);
    }
  };

  const fetchBudgets = useCallback(async () => {
    if (email) {
      try {
        const userBudgets = await getBudgetsByUser(email);
        setBudgets(userBudgets);
      } catch (error) {
        setNotification(`Erreur lors de la récupération des budgets! ${error}`);
      }
    }
  }, [email]);

  useEffect(() => {
    fetchBudgets();
  }, [email]);

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}
      <button
        className="btn mb-4"
        onClick={() =>
          (
            document.getElementById("my_modal_3") as HTMLDialogElement
          ).showModal()
        }
      >
        Nouveau budget
        <Landmark className="w-4" />
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Création d'un budget</h3>
          <p className="py-4">Permet de controller ces dépenses facilement.</p>
          <div className="flex flex-col w-full">
            <input
              type="text"
              className="input input-bordered mb-3 w-full"
              value={budgetName}
              placeholder="Nom du budget"
              onChange={(e) => setBudgetName(e.target.value)}
              required
            />
            <input
              type="number"
              className="input input-bordered mb-3 w-full"
              value={budgetAmount}
              placeholder="Montant du budget"
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
            />
            <button
              className="btn mb-3"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {selectedEmoji || "Séléctionner un emoji"}
            </button>
            {showEmojiPicker && (
              <div className="flex justify-center mb-3 items-center">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}
            <button className="btn" onClick={handleAddBudget}>
              Ajouter Budget
            </button>
          </div>
        </div>
      </dialog>

      <ul className="grid md:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <Link href={`/manage/${budget.id}`} key={budget.id}>
            <BudgetItem budget={budget} enableHover={1} />
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
};

export default Page;
