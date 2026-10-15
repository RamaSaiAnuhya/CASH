-- DropForeignKey
ALTER TABLE "TripMember" DROP CONSTRAINT "TripMember_tripId_fkey";

-- DropForeignKey
ALTER TABLE "TripMember" DROP CONSTRAINT "TripMember_userId_fkey";

-- AlterTable
ALTER TABLE "TripMember" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
