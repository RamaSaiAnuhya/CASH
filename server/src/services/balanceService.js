import prisma from "../config/database.js";
import calculateBalances from "../algorithms/calculateBalances.js";
import simplifyDebts from "../algorithms/simplifyDebts.js";

export async function getTripBalances(tripId, userId) {
  const trip = await prisma.trip.findUnique({
    where: {
      id: Number(tripId),
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      expenses: {
        include: {
          participants: true,
        },
      },
    },
  });

  if (!trip) {
    const error = new Error("Trip not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only trip members can view that trip's balances.
  const isMember = trip.members.some(
    (member) => member.userId === Number(userId),
  );

  if (!isMember) {
    const error = new Error("You are not a member of this trip.");
    error.statusCode = 403;
    throw error;
  }

  const members = trip.members.map((member) => ({
    userId: member.userId,
    user: member.user,
  }));

  const balances = calculateBalances(members, trip.expenses);

  const settlements = simplifyDebts(
    balances.map((member) => ({
      userId: member.userId,
      username: member.username,
      balancePaise: member.balancePaise,
    })),
  );

  return {
    tripId: trip.id,
    tripName: trip.name,
    balances,
    settlements,
    totalExpensesPaise: trip.expenses.reduce(
      (total, expense) => total + expense.amountPaise,
      0,
    ),
    expenseCount: trip.expenses.length,
  };
}
