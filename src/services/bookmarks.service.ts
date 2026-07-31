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
  limit: number = 20,
  offset: number = 0,
): Promise<{ bookmarks: BookmarkRecord[]; total: number }> {
  const where = { userId, bookId };
  const [rows, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.bookmark.count({ where }),
  ]);

  return { bookmarks: rows.map(mapBookmark), total };
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
  const { count } = await prisma.bookmark.deleteMany({
    where: { id: bookmarkId, userId },
  });

  if (count === 0) throw new Error('Bookmark not found');
}
