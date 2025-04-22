/*
  Warnings:

  - You are about to drop the column `jobDescription` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `jobLevel` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "jobDescription",
DROP COLUMN "jobLevel",
ADD COLUMN     "finalized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'Unspecified',
ADD COLUMN     "techstack" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "content";
