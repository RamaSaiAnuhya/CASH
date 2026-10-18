-- CreateEnum
CREATE TYPE "SharingMode" AS ENUM ('EQUAL', 'EXACT');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "sharingMode" TEXT NOT NULL DEFAULT 'EQUAL';
