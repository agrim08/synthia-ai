import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding IndexingStatus enum...');
    try {
      await prisma.$executeRawUnsafe(`CREATE TYPE "IndexingStatus" AS ENUM ('PENDING', 'INDEXING', 'COMPLETED', 'FAILED', 'PARTIAL');`);
      console.log('Enum created successfully.');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('Enum IndexingStatus already exists.');
      } else {
        throw e;
      }
    }

    console.log('Adding columns to Project table...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Project" 
      ADD COLUMN IF NOT EXISTS "indexingStatus" "IndexingStatus" NOT NULL DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS "indexingProgress" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "indexingTotal" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "indexingError" TEXT,
      ADD COLUMN IF NOT EXISTS "indexedAt" TIMESTAMP(3);
    `);
    console.log('Columns added successfully.');

  } catch (error) {
    console.error('Error applying schema changes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
