/*
  Warnings:

  - You are about to drop the `Submit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Submit";

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponseFields" (
    "id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "response_value" TEXT,
    "formresponse_id" TEXT NOT NULL,

    CONSTRAINT "FormResponseFields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponseOptions" (
    "id" TEXT NOT NULL,
    "opt_id" TEXT NOT NULL,
    "formresponsefield_id" TEXT NOT NULL,

    CONSTRAINT "FormResponseOptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormResponseFields" ADD CONSTRAINT "FormResponseFields_formresponse_id_fkey" FOREIGN KEY ("formresponse_id") REFERENCES "FormResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponseOptions" ADD CONSTRAINT "FormResponseOptions_formresponsefield_id_fkey" FOREIGN KEY ("formresponsefield_id") REFERENCES "FormResponseFields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
