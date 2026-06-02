import { prisma } from '../lib/db';
import type { NoteRecord } from '../types';

export async function listNotes(
  userId: string,
  bookId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ notes: NoteRecord[]; total: number }> {
  const where = { userId, bookId };
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.note.count({ where }),
  ]);

  return {
    notes: notes.map(mapNote),
    total,
  };
}

export async function createNote(
  userId: string,
  note: {
    book_id: string;
    highlight_id?: string;
    content: string;
  },
): Promise<NoteRecord> {
  const created = await prisma.note.create({
    data: {
      userId,
      bookId: note.book_id,
      highlightId: note.highlight_id || null,
      content: note.content,
    },
  });

  return mapNote(created);
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const { count } = await prisma.note.deleteMany({
    where: { id: noteId, userId },
  });

  if (count === 0) throw new Error('Note not found');
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: { content?: string; highlight_id?: string | null },
): Promise<NoteRecord> {
  try {
    const note = await prisma.note.update({
      where: { id: noteId, userId },
      data: {
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.highlight_id !== undefined && { highlightId: updates.highlight_id || null }),
      },
    });

    return mapNote(note);
  } catch (err: any) {
    if (err?.code === 'P2025') throw new Error('Note not found');
    throw err;
  }
}

export async function listAllNotes(
  userId: string,
  limit: number = 50,
  offset: number = 0,
) {
  const where = { userId };
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { book: { select: { title: true } } },
      take: limit,
      skip: offset,
    }),
    prisma.note.count({ where }),
  ]);

  return {
    notes: notes.map((n: any) => ({
      id: n.id,
      user_id: n.userId,
      book_id: n.bookId,
      book_title: n.book.title,
      highlight_id: n.highlightId,
      content: n.content,
      created_at: n.createdAt.toISOString(),
    })),
    total,
  };
}

function mapNote(n: any): NoteRecord {
  return {
    id: n.id,
    user_id: n.userId,
    book_id: n.bookId,
    highlight_id: n.highlightId,
    content: n.content,
    created_at: n.createdAt.toISOString(),
  };
}
