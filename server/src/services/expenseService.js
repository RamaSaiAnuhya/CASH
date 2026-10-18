import prisma from "../config/database.js";
import { calculateSplits } from "../algorithms/calculateSplits.js";

export async function createExpense({
  tripId,
  userId,
  name,
  amountPaise,
  payerId,
  participantIds,
}) {
  // The trip must exist, and the person creating the expense
  // must be a member of that trip.
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      members: {
        some: { userId },
      },
    },
    select: { id: true },
  });

  if (!trip) {
    throw new Error("Trip not found or you are not a member.");
  }

  const uniqueParticipantIds = [...new Set(participantIds)];

  // Check that the payer and all participants are members.
  const requiredIds = [...new Set([payerId, ...uniqueParticipantIds])];

  const members = await prisma.tripMember.findMany({
    where: {
      tripId,
      userId: { in: requiredIds },
    },
    select: { userId: true },
  });

  const memberIds = new Set(members.map((member) => member.userId));

  if (requiredIds.some((id) => !memberIds.has(id))) {
    throw new Error("Payer and participants must belong to this trip.");
  }

  const shares = calculateSplits(amountPaise, uniqueParticipantIds);

  // Save the expense and all participant shares atomically.
  // If a database operation fails, neither part is saved.
  const expense = await prisma.$transaction(async (tx) => {
    return tx.expense.create({
      data: {
        name: name.trim(),
        amountPaise,
        tripId,
        payerId,
        createdById: userId,
        participants: {
          create: shares.map((share) => ({
            userId: share.userId,
            sharePaise: share.sharePaise,
          })),
        },
      },
      include: {
        payer: {
          select: { id: true, username: true },
        },
        createdBy: {
          select: { id: true, username: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });
  });

  return expense;
}

export async function getTripExpenses(tripId, userId) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      members: {
        some: { userId },
      },
    },
    select: { id: true },
  });

  if (!trip) {
    throw new Error("Trip not found or you are not a member.");
  }

  return prisma.expense.findMany({
    where: { tripId },
    orderBy: { createdAt: "desc" },
    include: {
      payer: {
        select: { id: true, username: true },
      },
      createdBy: {
        select: { id: true, username: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      },
    },
  });
}

export async function updateExpense({
  tripId,
  expenseId,
  userId,
  name,
  amountPaise,
  payerId,
  participantIds,
}) {
  // Confirm that the requester belongs to this trip.
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      members: { some: { userId } },
    },
    select: { id: true },
  });

  if (!trip) {
    throw new Error("Trip not found or you are not a member.");
  }

  // Confirm that this expense belongs to this trip.
  const existingExpense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
    select: { id: true },
  });

  if (!existingExpense) {
    throw new Error("Expense not found.");
  }

  const uniqueParticipantIds = [...new Set(participantIds)];
  const requiredIds = [...new Set([payerId, ...uniqueParticipantIds])];

  const members = await prisma.tripMember.findMany({
    where: {
      tripId,
      userId: { in: requiredIds },
    },
    select: { userId: true },
  });

  const memberIds = new Set(members.map((member) => member.userId));

  if (requiredIds.some((id) => !memberIds.has(id))) {
    throw new Error("Payer and participants must belong to this trip.");
  }

  const shares = calculateSplits(amountPaise, uniqueParticipantIds);

  // Update the expense and replace its shares atomically.
  return prisma.$transaction(async (tx) => {
    await tx.expenseParticipant.deleteMany({
      where: { expenseId },
    });

    return tx.expense.update({
      where: { id: expenseId },
      data: {
        name: name.trim(),
        amountPaise,
        payerId,
        participants: {
          create: shares.map((share) => ({
            userId: share.userId,
            sharePaise: share.sharePaise,
          })),
        },
      },
      include: {
        payer: { select: { id: true, username: true } },
        createdBy: { select: { id: true, username: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });
  });
}

export async function deleteExpense({ tripId, expenseId, userId }) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      members: { some: { userId } },
    },
    select: { id: true },
  });

  if (!trip) {
    throw new Error("Trip not found or you are not a member.");
  }

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
    select: { id: true },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  // The schema cascades deletion to ExpenseParticipant records.
  await prisma.expense.delete({
    where: { id: expenseId },
  });

  return { message: "Expense deleted successfully." };
}
