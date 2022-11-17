/*
  Warnings:

  - Added the required column `form_id` to the `Field` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "form_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
