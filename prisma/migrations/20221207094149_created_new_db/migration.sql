/*
  Warnings:

  - You are about to drop the column `field_res_pos` on the `FormResponseFields` table. All the data in the column will be lost.
  - You are about to drop the column `opt_res_pos` on the `FormResponseOptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormResponseFields" DROP COLUMN "field_res_pos";

-- AlterTable
ALTER TABLE "FormResponseOptions" DROP COLUMN "opt_res_pos";
