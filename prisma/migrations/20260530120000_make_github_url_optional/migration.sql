-- Migration: make githubUrl optional to support ZIP-uploaded projects
-- This migration ONLY changes the column constraint — no data is deleted or modified.

ALTER TABLE "Project" ALTER COLUMN "githubUrl" DROP NOT NULL;
