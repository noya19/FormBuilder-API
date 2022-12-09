/*
  Warnings:

  - You are about to drop the column `ans` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Field` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Field" DROP COLUMN "ans",
DROP COLUMN "value";

-- CreateTable
CREATE TABLE "Options" (
    "id" TEXT NOT NULL,
    "option_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,

    CONSTRAINT "Options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Options" ADD CONSTRAINT "Options_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
