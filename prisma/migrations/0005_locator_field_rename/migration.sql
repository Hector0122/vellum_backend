-- Renames CFI-era columns to format-agnostic names now that they store either
-- legacy epub.js CFI strings or Readium Locator JSON, depending on when the
-- row was created. Data is preserved unchanged — this is a rename only.

ALTER TABLE "books" RENAME COLUMN "progress_cfi" TO "progress_locator";
ALTER TABLE "highlights" RENAME COLUMN "location" TO "locator";
ALTER TABLE "bookmarks" RENAME COLUMN "cfi" TO "locator";
