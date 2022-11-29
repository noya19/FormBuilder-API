/*
  Warnings:

  - The `option_pos` column on the `Submit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Submit" DROP COLUMN "option_pos",
ADD COLUMN     "option_pos" INTEGER;
