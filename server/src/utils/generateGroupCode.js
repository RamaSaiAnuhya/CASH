import crypto from "node:crypto";
import prisma from "../config/database.js";
const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function generateGroupCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const randomBytes = crypto.randomBytes(6);
    let suffix = "";

    for (const byte of randomBytes) {
      suffix += CHARACTERS[byte % CHARACTERS.length];
    }

    const groupCode = `CASH-${suffix}`;

    const existingTrip = await prisma.trip.findUnique({
      where: { groupCode },
      select: { id: true },
    });

    if (!existingTrip) return groupCode;
  }

  throw new Error("Unable to generate a unique group code");
}
