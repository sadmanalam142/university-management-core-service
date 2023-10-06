/*
  Warnings:

  - You are about to drop the column `academicDepartmentId` on the `faculties` table. All the data in the column will be lost.
  - You are about to drop the column `academicFacultyId` on the `faculties` table. All the data in the column will be lost.
  - Added the required column `buildingId` to the `faculties` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_academicDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_academicFacultyId_fkey";

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "academicDepartmentId",
DROP COLUMN "academicFacultyId",
ADD COLUMN     "buildingId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
