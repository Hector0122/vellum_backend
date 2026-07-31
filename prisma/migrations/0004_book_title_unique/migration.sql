-- Enforces the duplicate-book check ({userId, title}) at the database level,
-- closing a race condition where two concurrent uploads could both pass the
-- application-level check and create duplicate-titled books.
--
-- IMPORTANT: run this audit query first and resolve any existing violations
-- (this constraint cannot apply while duplicates exist):
--
--   SELECT user_id, title, count(*)
--   FROM books
--   GROUP BY user_id, title
--   HAVING count(*) > 1;

ALTER TABLE "books" ADD CONSTRAINT "books_user_id_title_key" UNIQUE ("user_id", "title");
