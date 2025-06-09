"use client";

import {
  addTransactionToBudget,
  deleteBudget,
  deleteTransaction,
  getTransactionsByBudgetId,
} from "@/app/actions";
import BudgetItem from "@/app/components/BudgetItem";
import Wrapper from "@/app/components/Wrapper";
import Notification from "../../components/Notification";
import { Budget } from "@/type";
import React, { useEffect, useState } from "react";
import { Send, Trash } from "lucide-react";
import { redirect } from "next/navigation";

const Page = ({ params }: { params: { budgetId: string } }) => {
  const budgetId = params.budgetId;
  const [budget, setBudget] = useState<Budget>();
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notification, setNotification] = useState<string>("");

  const fetchBudgetData = async (budgetId: string) => {
    try {
      if (budgetId) {
        const budgetData = await getTransactionsByBudgetId(budgetId);
        setBudget(budgetData);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du budget et des transactions",
        error
      );
      throw error;
    }
  };

  const closeNotification = () => {
    setNotification("");
  };

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      setNotification("Veuillez remplir tous les champs!");
      return;
    }
    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Le montant doit être un nombre positif!");
      }
      await addTransactionToBudget(budgetId, amountNumber, description);
      setNotification("Transaction ajouter avec succès!");
      fetchBudgetData(budgetId);
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de transaction :", error);
      setNotification("Vous avez dépasser votre budget");
    }
  };
  const handleDeleteBudget = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce budget et toutes ses transactions associés?"
    );
    if (confirmed) {
      try {
        await deleteBudget(budgetId);
      } catch (error) {
        console.error("Erreur lors de la suppression du budget!", error);
      }
      redirect("/budgets");
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce transaction?"
    );
    if (confirmed) {
      try {
        await deleteTransaction(transactionId);
        fetchBudgetData(budgetId);
        setNotification("Dépense supprimé!");
      } catch (error) {
        console.error("Erreur lors de la suppression de transaction!", error);
      }
    }
  };

  useEffect(() => {
    fetchBudgetData(budgetId);
  }, [budgetId]);

  return (
    <Wrapper>
      {notification && (
        <Notification message={notification} onclose={closeNotification} />
      )}
      <div>
        {budget && (
          <div className="flex md:flex-row flex-col">
            <div className="md:w-1/3">
              <BudgetItem budget={budget} enableHover={0} />
              <button className="btn mt-4" onClick={() => handleDeleteBudget()}>
                Supprimer le budget
              </button>
              <div className="space-y-4 flex flex-col mt-4">
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="input input-bordered w-full"
                  required
                />
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Montant"
                  className="input input-bordered w-full"
                  required
                />
                <button onClick={handleAddTransaction} className="btn">
                  Ajouter votre dépense
                </button>
              </div>
            </div>
            {budget.transactions && budget.transactions.length > 0 ? (
              <div className="overflow-x-auto md:mt-0 mt-4 md:w-2/3 ml-4">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Montant</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <th className="text-lg md:text-3xl">
                          {transaction.emoji}
                        </th>
                        <td>
                          <div className="badge badge-accent badge-xs md:badge-sm">
                            - {transaction.amount} Ar
                          </div>
                        </td>
                        <td>{transaction.description}</td>
                        <td>
                          {transaction.createdAt.toLocaleDateString("fr-FR")}
                        </td>
                        <td>
                          {transaction.createdAt.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                          >
                            <Trash className="w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="md:w-2/3 mt-10 md:ml-4 flex items-center justify-center">
                <Send strokeWidth={1.5} className="w-8 h-8 text-accent" />
                <span className="text-gray-500 ml-2">Aucune transaction.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default Page;
