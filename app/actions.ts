"use server";

import { prisma } from "@/lib/prisma";

export const checkAndAddUser = async (email: string | undefined) => {
  if (!email) return;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: { email },
      });
      console.log("Nouvel utilisateur ajouté dans la base données");
    }
    console.log(" Utilisateur déjà présent dans la base données");
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur: ", error);
  }
};

export const addBudget = async (
  email: string,
  name: string,
  amount: number,
  selectedEmojy: string
) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    await prisma.budget.create({
      data: {
        name,
        amount,
        emoji: selectedEmojy,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du budget: ", error);
    throw error;
  }
};

export const getBudgetsByUser = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budget: {
          include: { transactions: true },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user.budget;
  } catch (error) {
    console.log("Erreur lors de la récupération des budgets!", error);
    throw error;
  }
};

export const getTransactionsByBudgetId = async (budgetId: string) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { transactions: true },
    });

    if (!budget) {
      throw new Error("Budget non trouvé!");
    }
    return budget;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions!", error);
    throw error;
  }
};

export const addTransactionToBudget = async (
  budgetId: string,
  amount: number,
  description: string
) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { transactions: true },
    });
    if (!budget) {
      throw new Error("Budget non trouvé!");
    }
    const transactionAmount = budget.transactions
      ? budget.transactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        )
      : 0;
    const totalTransaction = transactionAmount + amount;
    if (totalTransaction > budget.amount) {
      throw new Error(
        "Le montant total des transactions dépasses le montant du budget."
      );
    }
    const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        emoji: budget.emoji,
        budget: {
          connect: {
            id: budget.id,
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la transaction!", error);
    throw error;
  }
};

export const deleteBudget = async (budgetId: string) => {
  try {
    await prisma.transaction.deleteMany({ where: { budgetId } });
    await prisma.budget.delete({ where: { id: budgetId } });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du budget et des transactions associés!",
      error
    );
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new Error("Transaction non trouvé!");
    }
    await prisma.transaction.delete({ where: { id: transactionId } });
  } catch (error) {
    console.error("Erreur lors de la suppression de la transaction!", error);
    throw error;
  }
};

export const getTransactionByEmailAndPeriode = async (
  email: string,
  periode: string
) => {
  try {
    const now = new Date();
    let dateLimit;

    switch (periode) {
      case "last30":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 30);
        break;
      case "last90":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 9);
        break;
      case "last7":
        dateLimit = new Date(now);
        dateLimit.setDate(now.getDate() - 7);
        break;
      case "last365":
        dateLimit = new Date(now);
        dateLimit.setFullYear(now.getFullYear() - 1);
        break;

      default:
        throw new Error("Periode Invalide!");
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budget: {
          include: {
            transactions: {
              where: {
                createdAt: {
                  gte: dateLimit,
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé!");
    }

    const transactions = user.budget.flatMap((bdgt) =>
      bdgt.transactions.map((transaction) => ({
        ...transaction,
        budgetName: bdgt.name,
        budgetId: bdgt.id,
      }))
    );

    return transactions;
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions!", error);
    throw error;
  }
};

//dashboard
export const getTotalTransactionAmount = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budget: {
          include: {
            transactions: true,
          },
        },
      },
    });
    if (!user) throw new Error("Utilisateur non trouvé!");

    const totalAmount = user.budget.reduce((sum, bdgt) => {
      return (
        sum +
        bdgt.transactions.reduce(
          (bdgtsum, transaction) => bdgtsum + transaction.amount,
          0
        )
      );
    }, 0);
    return totalAmount;
  } catch (error) {
    console.error("Erreur lors du calcul du montant des transactions: ", error);
    throw error;
  }
};

export const getTotalTransactionCount = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budget: {
          include: {
            transactions: true,
          },
        },
      },
    });
    if (!user) throw new Error("Utilisateur non trouvé!");
    const totalCount = user.budget.reduce((count, bdgt) => {
      return count + bdgt.transactions.length;
    }, 0);
    return totalCount;
  } catch (error) {
    console.error("Erreur lors du comptage des transactions", error);
    throw error;
  }
};

export const getReachedBudgets = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budget: {
          include: {
            transactions: true,
          },
        },
      },
    });
    if (!user) throw new Error("Utilisateur non trouvé!");
    const totalBudgets = user.budget.length;
    const reachedBudgets = user.budget.filter((bdgt) => {
      const totalTransactionAmount = bdgt.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return totalTransactionAmount >= bdgt.amount;
    }).length;
    return `${reachedBudgets}/${totalBudgets}`;
  } catch (error) {
    console.error("Erreur lors du calcul des budgets atteints: ", error);
    throw error;
  }
};

export const getUserBudgetData = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budget: {
          include: {
            transactions: true,
          },
        },
      },
    });
    if (!user) throw new Error("Utilisateur non trouvé!");

    const data = user.budget.map((bdgt) => {
      const totalTransaction = bdgt.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );
      return {
        budgetName: bdgt.name,
        totalBudgetAmount: bdgt.amount,
        totalTransaction,
      };
    });
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données: ", error);
    throw error;
  }
};

export const getLastTransaction = async (email: string) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        budget: {
          user: {
            email: email,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        budget: {
          select: {
            name: true,
          },
        },
      },
    });
    const transactionsWithBudgetName = transactions.map((transaction) => ({
      ...transaction,
      budgetName: transaction.budget?.name || "N/A",
    }));

    return transactionsWithBudgetName;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dernières transactions: ",
      error
    );
    throw error;
  }
};

export const getLastBudgets = async (email: string) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        transactions: true,
      },
    });

    return budgets;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des derniers budgets: ",
      error
    );
    throw error;
  }
};
