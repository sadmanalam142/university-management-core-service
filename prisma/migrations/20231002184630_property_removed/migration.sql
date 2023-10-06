/*
  Warnings:

  - You are about to drop the column `academicFacultyId` on the `faculties` table. All the data in the column will be lost.
  - You are about to drop the column `academicDepartmentId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `academicFacultyId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `academicSemesterId` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_academicFacultyId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_academicDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_academicFacultyId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_academicSemesterId_fkey";

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "academicFacultyId";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "academicDepartmentId",
DROP COLUMN "academicFacultyId",
DROP COLUMN "academicSemesterId";
