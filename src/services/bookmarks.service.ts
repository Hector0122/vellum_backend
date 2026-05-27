import { prisma } from '../lib/db';

export interface BookmarkRecord {
  id: string;
  user_id: string;
  book_id: string;
  cfi: string;
  label: string | null;
  created_at: string;
}

function mapBookmark(b: any): BookmarkRecord {
  return {
    id: b.id,
    user_id: b.userId,
    book_id: b.bookId,
    cfi: b.cfi,
    label: b.label,
    created_at: b.createdAt.toISOString(),
  };
}

export async function listBookmarks(
  userId: string,
  bookId: string,
): Promise<BookmarkRecord[]> {
  const rows = await prisma.bookmark.findMany({
    where: { userId, bookId },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(mapBookmark);
}

export async function createBookmark(
  userId: string,
  bookId: string,
  cfi: string,
  label?: string,
): Promise<BookmarkRecord> {
  const created = await prisma.bookmark.create({
    data: { userId, bookId, cfi, label },
  });
  return mapBookmark(created);
}

export async function deleteBookmark(
  userId: string,
  bookmarkId: string,
): Promise<void> {
  await prisma.bookmark.deleteMany({
    where: { id: bookmarkId, userId },
  });
}
