/*
  Warnings:

  - You are about to drop the `_GroupMessageToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `senderId` to the `GroupMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GroupMessageToUser" DROP CONSTRAINT "_GroupMessageToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupMessageToUser" DROP CONSTRAINT "_GroupMessageToUser_B_fkey";

-- AlterTable
ALTER TABLE "GroupMessage" ADD COLUMN     "senderId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_GroupMessageToUser";

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "gmail" TEXT NOT NULL,
    "Otp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
