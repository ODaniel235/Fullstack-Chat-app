-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "StatusData" ALTER COLUMN "views" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "likes" SET DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "admins" TEXT[],
    "viewed" TEXT[],
    "lastMessage" JSONB,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupsToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupsToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupsToUser_B_index" ON "_GroupsToUser"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupsToUser" ADD CONSTRAINT "_GroupsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupsToUser" ADD CONSTRAINT "_GroupsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
