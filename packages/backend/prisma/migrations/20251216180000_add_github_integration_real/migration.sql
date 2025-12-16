-- AlterTable: Add githubRepo to Project
ALTER TABLE "Project" ADD COLUMN "githubRepo" TEXT;

-- AlterTable: Update Commit table
ALTER TABLE "Commit" ADD COLUMN "url" TEXT;
ALTER TABLE "Commit" ADD COLUMN "committedAt" TIMESTAMP(3);

-- Update existing commits to have committedAt = createdAt
UPDATE "Commit" SET "committedAt" = "createdAt" WHERE "committedAt" IS NULL;

-- Make committedAt required after populating
ALTER TABLE "Commit" ALTER COLUMN "committedAt" SET NOT NULL;

-- Make hash required (update nulls first)
UPDATE "Commit" SET "hash" = 'unknown-' || id WHERE "hash" IS NULL;
ALTER TABLE "Commit" ALTER COLUMN "hash" SET NOT NULL;

-- Make repository required (update nulls first)
UPDATE "Commit" SET "repository" = 'unknown' WHERE "repository" IS NULL;
ALTER TABLE "Commit" ALTER COLUMN "repository" SET NOT NULL;

-- CreateIndex: Add unique constraint on hash
CREATE UNIQUE INDEX "Commit_hash_key" ON "Commit"("hash");

-- CreateTable: GitHubSyncLog
CREATE TABLE "GitHubSyncLog" (
    "id" SERIAL NOT NULL,
    "repository" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "commitsFound" INTEGER NOT NULL DEFAULT 0,
    "commitsLinked" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "GitHubSyncLog_pkey" PRIMARY KEY ("id")
);
