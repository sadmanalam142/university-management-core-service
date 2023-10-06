/*
  Warnings:

  - You are about to drop the column `academicDeparmentId` on the `faculties` table. All the data in the column will be lost.
  - Added the required column `academicDepartmentId` to the `faculties` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_academicDeparmentId_fkey";

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "academicDeparmentId",
ADD COLUMN     "academicDepartmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_academicDepartmentId_fkey" FOREIGN KEY ("academicDepartmentId") REFERENCES "academic_department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
