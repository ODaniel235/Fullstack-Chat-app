/*
  Warnings:

  - You are about to drop the column `liked` on the `StatusData` table. All the data in the column will be lost.
  - The `views` column on the `StatusData` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `likes` column on the `StatusData` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "StatusData" DROP COLUMN "liked",
DROP COLUMN "views",
ADD COLUMN     "views" TEXT[],
DROP COLUMN "likes",
ADD COLUMN     "likes" TEXT[];
