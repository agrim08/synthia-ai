-- AlterEnum (PostgreSQL appends new labels; Prisma matches by name)
ALTER TYPE "IndexingStatus" ADD VALUE 'SYNCING';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "lastIndexedCommitSha" TEXT;
ALTER TABLE "Project" ADD COLUMN "syncState" JSONB;
