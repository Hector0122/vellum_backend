import { prisma } from '../lib/db';
import type { NoteRecord } from '../types';

export async function listNotes(
  userId: string,
  bookId: string,
): Promise<NoteRecord[]> {
  const notes = await prisma.note.findMany({
    where: { userId, bookId },
    orderBy: { createdAt: 'asc' },
  });

  return notes.map(mapNote);
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
