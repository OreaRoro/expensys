"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link.js";
import Navbar from "./components/Navbar";
import BudgetItem from "./components/BudgetItem";
import budgets from "./data";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
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
                S'inscrire
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
