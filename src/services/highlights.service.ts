import { prisma } from '../lib/db';
import type { HighlightRecord } from '../types';

export async function listHighlights(
  userId: string,
  bookId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ highlights: HighlightRecord[]; total: number }> {
  const where = { userId, bookId };
  const [highlights, total] = await Promise.all([
    prisma.highlight.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.highlight.count({ where }),
  ]);

  return {
    highlights: highlights.map(mapHighlight),
    total,
  };
}

export async function createHighlight(
  userId: string,
  highlight: {
    book_id: string;
    text: string;
    locator: string;
    color?: string;
  },
): Promise<HighlightRecord> {
  const created = await prisma.highlight.create({
    data: {
      userId,
      bookId: highlight.book_id,
      text: highlight.text,
      locator: highlight.locator,
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

export async function updateHighlight(
  userId: string,
  highlightId: string,
  updates: { color?: string },
): Promise<HighlightRecord> {
  try {
    const highlight = await prisma.highlight.update({
      where: { id: highlightId, userId },
      data: {
        ...(updates.color !== undefined && { color: updates.color }),
      },
    });

    return mapHighlight(highlight);
  } catch (err: any) {
    if (err?.code === 'P2025') throw new Error('Highlight not found');
    throw err;
  }
}

export async function listAllHighlights(
  userId: string,
  limit: number = 50,
  offset: number = 0,
) {
  const where = { userId };
  const [highlights, total] = await Promise.all([
    prisma.highlight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { book: { select: { title: true } } },
      take: limit,
      skip: offset,
    }),
    prisma.highlight.count({ where }),
  ]);

  return {
    highlights: highlights.map((h: any) => ({
      id: h.id,
      user_id: h.userId,
      book_id: h.bookId,
      book_title: h.book.title,
      text: h.text,
      locator: h.locator,
      color: h.color,
      created_at: h.createdAt.toISOString(),
    })),
    total,
  };
}

function mapHighlight(h: any): HighlightRecord {
  return {
    id: h.id,
    user_id: h.userId,
    book_id: h.bookId,
    text: h.text,
    locator: h.locator,
    color: h.color,
    created_at: h.createdAt.toISOString(),
  };
}
