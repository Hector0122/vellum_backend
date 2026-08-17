import { prisma } from '../lib/db';
import { extractObjectKey, deleteObject, listObjectKeys } from '../lib/r2';
import type { BookRecord } from '../types';

export async function listBooks(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ books: BookRecord[]; total: number }> {
  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where: { userId },
      orderBy: { lastOpenedAt: { sort: 'desc', nulls: 'last' } },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        title: true,
        author: true,
        description: true,
        coverUrl: true,
        fileType: true,
        status: true,
        genres: true,
        progressPercent: true,
        progressLocator: true,
        currentPage: true,
        totalPages: true,
        lastOpenedAt: true,
        createdAt: true,
      },
    }),
    prisma.book.count({ where: { userId } }),
  ]);

  return {
    books: books.map(mapBook),
    total,
  };
}

export async function getBook(userId: string, bookId: string): Promise<BookRecord> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
  });

  if (!book) throw new Error('Book not found');
  return mapBook(book);
}

export async function createBook(
  userId: string,
  book: {
    title: string;
    author?: string;
    description?: string;
    cover_url?: string;
    file_url: string;
    file_type: 'epub' | 'pdf' | 'md';
    total_pages?: number;
  },
): Promise<BookRecord> {
  const existing = await prisma.book.findFirst({
    where: { userId, title: book.title },
  });

  if (existing) {
    throw new Error('DUPLICATE_BOOK');
  }

  try {
    const created = await prisma.book.create({
      data: {
        userId,
        title: book.title,
        author: book.author || null,
        description: book.description || null,
        coverUrl: book.cover_url || null,
        fileUrl: book.file_url,
        fileType: book.file_type,
        progressPercent: 0,
        totalPages: book.total_pages ?? null,
      },
    });

    return mapBook(created);
  } catch (err: any) {
    // Race condition: another concurrent request created a book with this
    // title between the check above and this insert. The DB-level unique
    // constraint (userId, title) catches what the pre-check can't.
    if (err?.code === 'P2002') throw new Error('DUPLICATE_BOOK');
    throw err;
  }
}

export async function updateBook(
  userId: string,
  bookId: string,
  updates: {
    title?: string;
    author?: string;
    description?: string;
    cover_url?: string;
    status?: 'unread' | 'reading' | 'read';
    progress_percent?: number;
    progress_locator?: string;
    current_page?: number;
    total_pages?: number;
    last_opened_at?: string;
  },
): Promise<BookRecord> {
  try {
    const data: any = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.author !== undefined) data.author = updates.author;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.cover_url !== undefined) data.coverUrl = updates.cover_url;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.progress_percent !== undefined) {
      data.progressPercent = updates.progress_percent;
      if (updates.progress_percent >= 100) {
        data.status = 'read';
      }
    }
    if (updates.progress_locator !== undefined) data.progressLocator = updates.progress_locator;
    if (updates.current_page !== undefined) data.currentPage = updates.current_page;
    if (updates.total_pages !== undefined) data.totalPages = updates.total_pages;
    if (updates.last_opened_at !== undefined) data.lastOpenedAt = new Date(updates.last_opened_at);

    // Auto-calculate progress_percent from pages if total_pages is set
    if (updates.current_page !== undefined && data.totalPages !== undefined) {
      data.progressPercent = Math.min(100, Math.round((data.currentPage / data.totalPages) * 100));
      if (data.progressPercent >= 100) data.status = 'read';
    } else if (updates.current_page !== undefined) {
      // totalPages not provided in this update — check current DB value
      const existing = await prisma.book.findUnique({
        where: { id: bookId },
        select: { totalPages: true },
      });
      if (existing?.totalPages && existing.totalPages > 0) {
        data.progressPercent = Math.min(100, Math.round((updates.current_page / existing.totalPages) * 100));
        if (data.progressPercent >= 100) data.status = 'read';
      }
    }

    const updated = await prisma.book.update({
      where: { id: bookId, userId },
      data,
    });

    return mapBook(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') throw new Error('Book not found');
    throw err;
  }
}

export async function deleteBook(userId: string, bookId: string): Promise<void> {
  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
    select: { fileUrl: true, coverUrl: true },
  });

  if (!book) throw new Error('Book not found');

  // Delete the DB record first (cascades to highlights/notes/bookmarks/sessions/
  // summaries). If R2 cleanup below fails or the process crashes, the result is
  // an orphaned *file* (recoverable via cleanup-orphans), not an orphaned DB row
  // pointing at deleted files — the safer failure mode for the user.
  await prisma.book.deleteMany({
    where: { id: bookId, userId },
  });

  const keys: string[] = [];
  const fileKey = extractObjectKey(book.fileUrl);
  if (fileKey) keys.push(fileKey);

  const coverKey = book.coverUrl ? extractObjectKey(book.coverUrl) : null;
  if (coverKey) keys.push(coverKey);

  const results = await Promise.allSettled(keys.map((key) => deleteObject(key)));
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`[deleteBook] Failed to delete R2 object ${keys[i]}:`, result.reason);
    }
  });
}

export async function searchBooks(
  userId: string,
  query: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ books: BookRecord[]; total: number }> {
  const where = {
    userId,
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { author: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
    ],
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { lastOpenedAt: { sort: 'desc', nulls: 'last' } },
      take: limit,
      skip: offset,
      select: {
        id: true,
        userId: true,
        title: true,
        author: true,
        description: true,
        coverUrl: true,
        fileType: true,
        status: true,
        genres: true,
        progressPercent: true,
        progressLocator: true,
        currentPage: true,
        totalPages: true,
        lastOpenedAt: true,
        createdAt: true,
      },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books: books.map(mapBook),
    total,
  };
}

function mapBook(book: any): BookRecord {
  return {
    id: book.id,
    user_id: book.userId,
    title: book.title,
    author: book.author,
    description: book.description,
    cover_url: book.coverUrl,
    file_url: book.fileUrl ?? null,
    file_type: book.fileType,
    status: book.status || 'unread',
    genres: book.genres || [],
    progress_percent: book.progressPercent,
    progress_locator: book.progressLocator ?? null,
    current_page: book.currentPage ?? 0,
    total_pages: book.totalPages ?? null,
    last_opened_at: book.lastOpenedAt?.toISOString() ?? null,
    created_at: book.createdAt.toISOString(),
  };
}

export async function cleanupOrphanedObjects(userId: string): Promise<{ deleted: number }> {
  // Get referenced URLs from this user's own books only
  const books = await prisma.book.findMany({
    where: { userId },
    select: { fileUrl: true, coverUrl: true },
  });

  const referencedKeys = new Set<string>();
  for (const book of books) {
    const fileKey = extractObjectKey(book.fileUrl);
    if (fileKey) referencedKeys.add(fileKey);

    const coverKey = book.coverUrl ? extractObjectKey(book.coverUrl) : null;
    if (coverKey) referencedKeys.add(coverKey);
  }

  // Only scan R2 objects under this user's own prefixes (uploads are keyed
  // books/{userId}/... and covers/{userId}/...) — never touch other users' files.
  const [bookKeys, coverKeys] = await Promise.all([
    listObjectKeys(`books/${userId}/`),
    listObjectKeys(`covers/${userId}/`),
  ]);
  const allKeys = [...bookKeys, ...coverKeys];

  // Find orphans
  const orphans = allKeys.filter((key) => !referencedKeys.has(key));

  // Delete orphans
  await Promise.allSettled(orphans.map((key) => deleteObject(key)));

  return { deleted: orphans.length };
}
