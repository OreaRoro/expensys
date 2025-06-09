"use client";

import { Transaction } from "@/type";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { getTransactionByEmailAndPeriode } from "../actions";
import Wrapper from "../components/Wrapper";
import TransactionItem from "../components/TransactionItem";

const Page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTransaction = async (periode: string) => {
    if (email) {
      setLoading(true);
      try {
        const transactionData = await getTransactionByEmailAndPeriode(
          email,
          periode
        );
        setTransactions(transactionData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récuération des transactions!", error);
      }
    }
  };

  useEffect(() => {
    fetchTransaction("last30");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
  return (
    <Wrapper>
      <div className="flex justify-end mb-5">
        <select
          className="input input-bordered input-md"
          defaultValue="last30"
          onChange={(e) => fetchTransaction(e.target.value)}
        >
          <option value="last7">7 Derniers jours</option>
          <option value="last30">30 Derniers jours</option>
          <option value="last90">90 Derniers jours</option>
          <option value="last365">365 Derniers jours</option>
        </select>
      </div>
      <div className="overflow-x-auto w-full bg-base-200/35 p-5 rounded-xl">
        {loading ? (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : transactions.length == 0 ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500 text-sm">
              Aucune transaction à afficher!
            </span>
          </div>
        ) : (
          <ul className="divide-y divide-base-300">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </ul>
        )}
      </div>
    </Wrapper>
  );
};

export default Page;
