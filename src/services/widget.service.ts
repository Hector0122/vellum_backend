import { prisma } from '../lib/db';
import type { BookRecord, HighlightRecord, BookmarkRecord } from '../types';

export interface WidgetData {
  book: BookRecord;
  highlights: HighlightRecord[];
  bookmarks: BookmarkRecord[];
}

export async function getWidgetData(
  userId: string,
  bookId: string,
): Promise<WidgetData> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
  });

  if (!book) throw new Error('Book not found');

  const [highlights, bookmarks] = await Promise.all([
    prisma.highlight.findMany({
      where: { userId, bookId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.bookmark.findMany({
      where: { userId, bookId },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return {
    book: {
      id: book.id,
      user_id: book.userId,
      title: book.title,
      author: book.author,
      description: book.description,
      cover_url: book.coverUrl,
      file_url: book.fileUrl,
      file_type: book.fileType as 'epub' | 'pdf',
      status: (book.status || 'unread') as 'unread' | 'reading' | 'read',
      genres: book.genres || [],
      progress_percent: book.progressPercent,
      progress_cfi: book.progressCfi ?? null,
      current_page: book.currentPage,
      total_pages: book.totalPages ?? null,
      last_opened_at: book.lastOpenedAt?.toISOString() ?? null,
      created_at: book.createdAt.toISOString(),
    },
    highlights: highlights.map((h) => ({
      id: h.id,
      user_id: h.userId,
      book_id: h.bookId,
      text: h.text,
      location: h.location,
      color: h.color,
      created_at: h.createdAt.toISOString(),
    })),
    bookmarks: bookmarks.map((b) => ({
      id: b.id,
      user_id: b.userId,
      book_id: b.bookId,
      cfi: b.cfi,
      label: b.label,
      created_at: b.createdAt.toISOString(),
    })),
  };
}

export interface BookmarkedBook {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: string;
  genres: string[];
  progress_percent: number;
  progress_cfi: string | null;
  last_opened_at: string | null;
  created_at: string;
  bookmark_count: number;
}

export async function listBookmarkedBooks(
  userId: string,
): Promise<BookmarkedBook[]> {
  const books = await prisma.book.findMany({
    where: {
      userId,
      bookmarks: { some: {} },
    },
    include: {
      bookmarks: { select: { id: true } },
    },
    orderBy: { lastOpenedAt: { sort: 'desc', nulls: 'last' } },
  });

  return books.map((b) => ({
    id: b.id,
    user_id: b.userId,
    title: b.title,
    author: b.author,
    cover_url: b.coverUrl,
    status: b.status || 'unread',
    genres: b.genres || [],
    progress_percent: b.progressPercent,
    progress_cfi: b.progressCfi ?? null,
    last_opened_at: b.lastOpenedAt?.toISOString() ?? null,
    created_at: b.createdAt.toISOString(),
    bookmark_count: b.bookmarks.length,
  }));
}
