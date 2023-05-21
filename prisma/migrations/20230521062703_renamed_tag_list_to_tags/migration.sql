/*
  Warnings:

  - You are about to drop the column `tagList` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "tagList",
ADD COLUMN     "tags" TEXT[];
