"use client";

import React, { useCallback, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import {
  getLastBudgets,
  getLastTransaction,
  getReachedBudgets,
  getTotalTransactionAmount,
  getTotalTransactionCount,
  getUserBudgetData,
} from "../actions";
import { CircleDollarSign, Landmark, PiggyBank } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Budget, Transaction } from "@/type";
import TransactionItem from "../components/TransactionItem";
import Link from "next/link";
import BudgetItem from "../components/BudgetItem";

type BudgetStat = {
  budgetName: string;
  totalBudgetAmount: number;
  totalTransaction: number;
};

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [totalAmount, setTotlaAmount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetStat[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [reachedBudgetsRatio, setReachedBudgetsRatio] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (email) {
        const amount = await getTotalTransactionAmount(email as string);
        const count = await getTotalTransactionCount(email as string);
        const reachedBudgets = await getReachedBudgets(email as string);
        const budgetsData = await getUserBudgetData(email as string);
        const lastTransactions = await getLastTransaction(email as string);
        const lastBudgets = await getLastBudgets(email as string);
        setTotlaAmount(amount);
        setTotalCount(count);
        setBudgetData(budgetsData);
        setReachedBudgetsRatio(reachedBudgets);
        setTransactions(lastTransactions);
        setBudgets(lastBudgets);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données!", error);
    }
  }, [email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <Wrapper>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-2 border-base-300 p-5 flex justify-between items-center rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">
                  Total des transactions
                </span>
                <span className="text-2xl font-bold text-accent">
                  {totalAmount !== null ? `${totalAmount} Ar` : "N/A"}
                </span>
              </div>
              <CircleDollarSign className="bg-accent w-9 h-9 rounded-full p-1 text-white" />
            </div>
            <div className="border-2 border-base-300 p-5 flex justify-between items-center rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">
                  Nombres des transactions
                </span>
                <span className="text-2xl font-bold text-accent">
                  {totalCount !== null ? `${totalCount}` : "N/A"}
                </span>
              </div>
              <PiggyBank className="bg-accent w-9 h-9 rounded-full p-1 text-white" />
            </div>
            <div className="border-2 border-base-300 p-5 flex justify-between items-center rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Budget atteint</span>
                <span className="text-2xl font-bold text-accent">
                  {reachedBudgetsRatio || "N/A"}
                </span>
              </div>
              <Landmark className="bg-accent w-9 h-9 rounded-full p-1 text-white" />
            </div>
          </div>

          <div className="w-full md:flex mt-4">
            <div className="rounded-xl md:w-2/3">
              <div className="border-2 border-base-300 p-5 rounded-xl">
                <h3 className="text-lg font-semibold mb-3">Statistiques</h3>
                <ResponsiveContainer height={250} width="100%">
                  <BarChart width={730} height={250} data={budgetData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="budgetName" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      name="Budget"
                      dataKey="totalBudgetAmount"
                      fill="#EF9FBC"
                      radius={[10, 10, 0, 0]}
                    />
                    <Bar
                      name="Dépensé"
                      dataKey="totalTransaction"
                      fill="#EEAF3A"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 border-2 border-base-300 p-5 rounded-xl">
                <h3 className="text-lg font-semibold  mb-3">
                  Derniers Transacttions
                </h3>
                <ul className="divide-y divide-base-300">
                  {transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                    ></TransactionItem>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:w-1/3 ml-4">
              <h3 className="text-lg font-semibold my-4 md:mb-4 md:mt-0">
                Derniers Budgets
              </h3>
              <ul className="grid grid-cols-1 gap-4">
                {budgets.map((budget) => (
                  <Link href={`/manage/${budget.id}`} key={budget.id}>
                    <BudgetItem budget={budget} enableHover={1}></BudgetItem>
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Page;
