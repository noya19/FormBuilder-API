/*
  Warnings:

  - Changed the type of `field_id` on the `Field` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Field" DROP COLUMN "field_id",
ADD COLUMN     "field_id" INTEGER NOT NULL;
