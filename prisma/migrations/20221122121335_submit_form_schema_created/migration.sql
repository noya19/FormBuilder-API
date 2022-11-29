-- CreateTable
CREATE TABLE "Submit" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "field_pos" INTEGER NOT NULL,
    "answer" TEXT,
    "option_id" TEXT,
    "option_pos" TEXT,

    CONSTRAINT "Submit_pkey" PRIMARY KEY ("id")
);
