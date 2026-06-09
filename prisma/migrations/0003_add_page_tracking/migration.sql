-- AlterTable
ALTER TABLE "books" ADD COLUMN     "current_page" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "books" ADD COLUMN     "total_pages" INTEGER;
