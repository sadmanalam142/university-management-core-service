/*
  Warnings:

  - You are about to drop the `academic_department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `academic_faculty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `academic_semester` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "academic_department" DROP CONSTRAINT "academic_department_academicFacultyId_fkey";

-- DropTable
DROP TABLE "academic_department";

-- DropTable
DROP TABLE "academic_faculty";

-- DropTable
DROP TABLE "academic_semester";
