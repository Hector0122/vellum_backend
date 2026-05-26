import { prisma } from '../lib/db';
import type { BookRecord } from '../types';

export async function listBooks(userId: string): Promise<BookRecord[]> {
  const books = await prisma.book.findMany({
    where: { userId },
    orderBy: { lastOpenedAt: { sort: 'desc', nulls: 'last' } },
  });

  return books.map(mapBook);
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
    file_type: 'epub' | 'pdf';
  },
): Promise<BookRecord> {
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
    },
  });

  return mapBook(created);
}

export async function updateBook(
  userId: string,
  bookId: string,
  updates: {
    title?: string;
    author?: string;
    description?: string;
    cover_url?: string;
    progress_percent?: number;
    progress_cfi?: string;
    last_opened_at?: string;
  },
): Promise<BookRecord> {
  const updated = await prisma.book.updateMany({
    where: { id: bookId, userId },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.author !== undefined && { author: updates.author }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.cover_url !== undefined && { coverUrl: updates.cover_url }),
      ...(updates.progress_percent !== undefined && { progressPercent: updates.progress_percent }),
      ...(updates.progress_cfi !== undefined && { progressCfi: updates.progress_cfi }),
      ...(updates.last_opened_at !== undefined && { lastOpenedAt: new Date(updates.last_opened_at) }),
    },
  });

  if (updated.count === 0) throw new Error('Book not found');

  return getBook(userId, bookId);
}

export async function deleteBook(userId: string, bookId: string): Promise<void> {
  const { count } = await prisma.book.deleteMany({
    where: { id: bookId, userId },
  });

  if (count === 0) throw new Error('Book not found');
}

function mapBook(book: any): BookRecord {
  return {
    id: book.id,
    user_id: book.userId,
    title: book.title,
    author: book.author,
    description: book.description,
    cover_url: book.coverUrl,
    file_url: book.fileUrl,
    file_type: book.fileType,
    progress_percent: book.progressPercent,
    progress_cfi: book.progressCfi ?? null,
    last_opened_at: book.lastOpenedAt?.toISOString() ?? null,
    created_at: book.createdAt.toISOString(),
  };
}
