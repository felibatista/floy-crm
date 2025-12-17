-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'ARS',
ADD COLUMN     "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentDueDate" TIMESTAMP(3),
ADD COLUMN     "totalAmount" DECIMAL(12,2);
