-- CreateEnum
CREATE TYPE "SemesterRegistrationStatus" AS ENUM ('UPCOMING', 'ONGOING', 'ENDED');

-- CreateTable
CREATE TABLE "SemesterRegistration" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SemesterRegistrationStatus" DEFAULT 'UPCOMING',
    "minCredit" INTEGER NOT NULL,
    "maxCredit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "academicSemesterId" TEXT NOT NULL,

    CONSTRAINT "SemesterRegistration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SemesterRegistration" ADD CONSTRAINT "SemesterRegistration_academicSemesterId_fkey" FOREIGN KEY ("academicSemesterId") REFERENCES "academic_semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
