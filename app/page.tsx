"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link.js";
import Navbar from "./components/Navbar";
import BudgetItem from "./components/BudgetItem";
import budgets from "./data";
import { useCallback, useEffect, useState } from "react";
import { Budget } from "@/type";
import { getBudgetsByUser } from "./actions";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const fetchBudgets = useCallback(async () => {
    if (email) {
      try {
        const userBudgets = await getBudgetsByUser(email);
        setBudgets(userBudgets);
      } catch (error) {
        console.error("Erreur lors de la récupértion des budgets: ", error);
      }
    }
  }, [email]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);
  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center flex-col py-10 w-full">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Prenez le controle <br /> de votre finance
          </h1>
          <p className="py-6 text-gray-800 text-center">
            Suivez vos budgets et vos dépenses <br /> en toute simplicité avec
            notre application intuitive !
          </p>
          {!isSignedIn && (
            <div className="flex items-center justify-center">
              <Link
                href={"/sign-in"}
                className="btn btn-sm md:btn-md btn-outline btn-accent"
              >
                Se connecter
              </Link>
              <Link
                href={"/sign-up"}
                className="btn btn-sm md:btn-md btn-accent ml-2"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}
          <ul className="grid md:grid-cols-3 gap-4 md:min-w-[1200px] mt-6">
            {budgets.map((budget) => (
              <Link href={""} key={budget.id}>
                <BudgetItem budget={budget} enableHover={1} />
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
