/*
  Warnings:

  - Changed the type of `status` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "status" AS ENUM ('online', 'offline');

-- CreateEnum
CREATE TYPE "statusType" AS ENUM ('image', 'video', 'text');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "status" "status" NOT NULL;

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Status" (
    "userId" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "StatusData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "statusType" NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "backgroundColor" TEXT,

    CONSTRAINT "StatusData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StatusData" ADD CONSTRAINT "StatusData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Status"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
