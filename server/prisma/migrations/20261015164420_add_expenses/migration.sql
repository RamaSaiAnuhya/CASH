-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "tripId" INTEGER NOT NULL,
    "payerId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseParticipant" (
    "expenseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "sharePaise" INTEGER NOT NULL,

    CONSTRAINT "ExpenseParticipant_pkey" PRIMARY KEY ("expenseId","userId")
);

-- CreateIndex
CREATE INDEX "Expense_tripId_createdAt_idx" ON "Expense"("tripId", "createdAt");

-- CreateIndex
CREATE INDEX "Expense_payerId_idx" ON "Expense"("payerId");

-- CreateIndex
CREATE INDEX "ExpenseParticipant_userId_idx" ON "ExpenseParticipant"("userId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseParticipant" ADD CONSTRAINT "ExpenseParticipant_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseParticipant" ADD CONSTRAINT "ExpenseParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
