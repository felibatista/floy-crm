/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `Task` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignedToId" INTEGER,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_code_key" ON "Task"("code");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
