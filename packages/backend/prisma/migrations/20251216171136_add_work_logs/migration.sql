-- CreateEnum
CREATE TYPE "WorkLogType" AS ENUM ('desarrollo', 'gestion', 'testing', 'documentacion', 'reunion', 'otro');

-- CreateTable
CREATE TABLE "WorkLog" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "type" "WorkLogType" NOT NULL DEFAULT 'desarrollo',
    "dateWorked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
