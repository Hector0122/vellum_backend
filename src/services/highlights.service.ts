import { prisma } from '../lib/db';
import type { HighlightRecord } from '../types';

export async function listHighlights(
  userId: string,
  bookId: string,
): Promise<HighlightRecord[]> {
  const highlights = await prisma.highlight.findMany({
    where: { userId, bookId },
    orderBy: { createdAt: 'asc' },
  });

  return highlights.map(mapHighlight);
}

export async function createHighlight(
  userId: string,
  highlight: {
    book_id: string;
    text: string;
    location: string;
    color?: string;
  },
): Promise<HighlightRecord> {
  const created = await prisma.highlight.create({
    data: {
      userId,
      bookId: highlight.book_id,
      text: highlight.text,
      location: highlight.location,
      color: highlight.color || '#FFD700',
    },
  });

  return mapHighlight(created);
}

export async function deleteHighlight(
  userId: string,
  highlightId: string,
): Promise<void> {
  const { count } = await prisma.highlight.deleteMany({
    where: { id: highlightId, userId },
  });

  if (count === 0) throw new Error('Highlight not found');
}

function mapHighlight(h: any): HighlightRecord {
  return {
    id: h.id,
    user_id: h.userId,
    book_id: h.bookId,
    text: h.text,
    location: h.location,
    color: h.color,
    created_at: h.createdAt.toISOString(),
  };
}
