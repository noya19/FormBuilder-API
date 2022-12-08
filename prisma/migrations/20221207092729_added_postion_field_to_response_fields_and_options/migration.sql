/*
  Warnings:

  - Added the required column `field_res_pos` to the `FormResponseFields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opt_res_pos` to the `FormResponseOptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormResponseFields" ADD COLUMN     "field_res_pos" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FormResponseOptions" ADD COLUMN     "opt_res_pos" INTEGER NOT NULL;
