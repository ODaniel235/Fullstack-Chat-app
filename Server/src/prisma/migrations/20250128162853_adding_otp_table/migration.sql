/*
  Warnings:

  - You are about to drop the column `gmail` on the `Otp` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "gmail",
ADD COLUMN     "userId" TEXT NOT NULL;
