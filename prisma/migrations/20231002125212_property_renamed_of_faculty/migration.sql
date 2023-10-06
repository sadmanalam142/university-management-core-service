/*
  Warnings:

  - You are about to drop the column `academicDepaermentId` on the `faculties` table. All the data in the column will be lost.
  - Added the required column `academicDeparmentId` to the `faculties` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_academicDepaermentId_fkey";

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "academicDepaermentId",
ADD COLUMN     "academicDeparmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_academicDeparmentId_fkey" FOREIGN KEY ("academicDeparmentId") REFERENCES "academic_department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
