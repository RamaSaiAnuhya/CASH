import prisma from "../config/database.js";
import { generateGroupCode } from "../utils/generateGroupCode.js";

const MAX_CODE_ATTEMPTS = 10;

export async function createTrip(userId, name) {
  const cleanName = name?.trim();

  if (!cleanName) {
    const error = new Error("Trip name is required");
    error.statusCode = 400;
    throw error;
  }

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    // ✅ Await the async function
    const groupCode = await generateGroupCode(prisma);

    const existingTrip = await prisma.trip.findUnique({
      where: { groupCode }, // ✅ now a string
      select: { id: true },
    });

    if (existingTrip) continue;

    try {
      return await prisma.$transaction(async (tx) => {
        const trip = await tx.trip.create({
          data: {
            name: cleanName,
            groupCode,
            creatorId: userId,
          },
        });

        await tx.tripMember.create({
          data: {
            tripId: trip.id,
            userId,
            role: "OWNER",
          },
        });

        return trip;
      });
    } catch (error) {
      if (error.code === "P2002" && error.meta?.target?.includes("groupCode")) {
        continue;
      }
      throw error;
    }
  }

  const error = new Error(
    "Could not generate a unique group code. Please try again.",
  );
  error.statusCode = 503;
  throw error;
}

export async function joinTrip(userId, groupCode) {
  const cleanCode = groupCode?.trim().toUpperCase();

  if (!cleanCode) {
    const error = new Error("Group code is required");
    error.statusCode = 400;
    throw error;
  }

  const trip = await prisma.trip.findUnique({
    where: { groupCode: cleanCode },
  });

  if (!trip) {
    const error = new Error("Invalid group code");
    error.statusCode = 404;
    throw error;
  }

  const existingMembership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: {
        tripId: trip.id,
        userId,
      },
    },
  });

  if (existingMembership) {
    return {
      alreadyMember: true,
      trip,
    };
  }

  try {
    await prisma.tripMember.create({
      data: {
        tripId: trip.id,
        userId,
        role: "MEMBER",
      },
    });
  } catch (error) {
    // Handles simultaneous join requests for the same user.
    if (error.code === "P2002") {
      const membership = await prisma.tripMember.findUnique({
        where: {
          tripId_userId: {
            tripId: trip.id,
            userId,
          },
        },
      });

      if (!membership) throw error;

      return {
        alreadyMember: true,
        trip,
      };
    }

    throw error;
  }

  return {
    alreadyMember: false,
    trip,
  };
}

export async function getUserTrips(userId) {
  return prisma.trip.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      groupCode: true,
      creatorId: true,
      createdAt: true,
    },
  });
}
