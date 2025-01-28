/*
  Warnings:

  - You are about to drop the column `type` on the `GroupMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GroupMessage" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "_GroupMessageToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupMessageToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupMessageToUser_B_index" ON "_GroupMessageToUser"("B");

-- AddForeignKey
ALTER TABLE "_GroupMessageToUser" ADD CONSTRAINT "_GroupMessageToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMessageToUser" ADD CONSTRAINT "_GroupMessageToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
