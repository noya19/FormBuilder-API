-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_form_id_fkey";

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
