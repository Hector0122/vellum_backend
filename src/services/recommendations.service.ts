import { prisma } from '../lib/db';
import { callGroq, callGemini } from '../lib/ai';
import type { BookSuggestionRecord } from '../types';

export const VALID_GENRES = [
  'Ficción',
  'Terror',
  'Suspenso',
  'Romance',
  'Fantasía',
  'Ciencia Ficción',
  'Historia',
  'Filosofía',
  'Biografía',
  'Negocios',
  'Autoayuda',
  'Ciencia',
  'Arte',
  'Humor',
  'Aventura',
];

function parseJsonFromAi(content: string): any {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  // Try to find JSON array/object directly
  const directMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (directMatch) {
    return JSON.parse(directMatch[1]);
  }
  return JSON.parse(content);
}

export async function extractBookGenres(bookId: string): Promise<string[]> {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error('Book not found');

  // Already extracted?
  if (book.genres && book.genres.length > 0) {
    return book.genres;
  }

  const prompt = `Dado el libro "${book.title}" de ${book.author || 'autor desconocido'} con la siguiente descripción: "${book.description || 'Sin descripción'}".

Clasifícalo usando SOLO géneros de esta lista exacta: ${VALID_GENRES.join(', ')}.
Devuélveme un JSON con el campo "genres" que es un array de strings. Máximo 3 géneros. Si no encaja claramente en ninguno, usa ["Ficción"].

Responde SOLO con el JSON, sin explicaciones.`;

  let rawContent: string;
  try {
    rawContent = await callGroq(prompt);
  } catch (err: any) {
    console.warn(`[AI] Groq failed extracting genres: ${err.message}, falling back to Gemini`);
    rawContent = await callGemini(prompt);
  }

  let result: { genres?: string[] };
  try {
    result = parseJsonFromAi(rawContent);
  } catch {
    console.warn('[AI] Failed to parse genre JSON, defaulting to Ficción');
    result = { genres: ['Ficción'] };
  }

  const genres = (result.genres || [])
    .map((g: string) => g.trim())
    .filter((g: string) => VALID_GENRES.includes(g));

  const finalGenres = genres.length > 0 ? genres : ['Ficción'];

  await prisma.book.update({
    where: { id: bookId },
    data: { genres: finalGenres },
  });

  return finalGenres;
}

export async function generateRecommendations(userId: string): Promise<BookSuggestionRecord[]> {
  // Get all read books
  const readBooks = await prisma.book.findMany({
    where: { userId, status: 'read' },
    select: { id: true, title: true, author: true, description: true, genres: true },
  });

  if (readBooks.length === 0) {
    throw new Error('No tienes libros marcados como leídos. Lee algunos libros primero para recibir recomendaciones.');
  }

  // Ensure all read books have genres
  const booksWithGenres = await Promise.all(
    readBooks.map(async (book) => {
      if (!book.genres || book.genres.length === 0) {
        const genres = await extractBookGenres(book.id);
        return { ...book, genres };
      }
      return book;
    }),
  );

  // Delete old suggestions
  await prisma.bookSuggestion.deleteMany({ where: { userId, status: 'suggested' } });

  const booksList = booksWithGenres
    .map((b) => `- "${b.title}" de ${b.author || 'autor desconocido'} (${b.genres.join(', ')})`)
    .join('\n');

  const prompt = `Este usuario ha leído los siguientes libros:\n${booksList}\n\nBasado en sus preferencias de lectura, recomiéndale exactamente 3 libros que NO haya leído (debe ser un título real y conocido). Para cada uno devuelve:\n- title: título del libro\n- author: autor\n- synopsis: sinopsis de 2-3 líneas\n- genres: array de géneros usando SOLO de esta lista exacta: ${VALID_GENRES.join(', ')}\n- reason: una breve razón de 1 línea de por qué se recomienda basado en sus lecturas previas\n\nSé variado pero alineado a sus gustos. Devuelve SOLO un JSON con el campo "recommendations" que es un array de objetos.`;

  let rawContent: string;
  try {
    rawContent = await callGroq(prompt);
  } catch (err: any) {
    console.warn(`[AI] Groq failed generating recommendations: ${err.message}, falling back to Gemini`);
    rawContent = await callGemini(prompt);
  }

  let result: { recommendations?: any[] };
  try {
    result = parseJsonFromAi(rawContent);
  } catch {
    console.warn('[AI] Failed to parse recommendations JSON');
    throw new Error('No se pudieron generar recomendaciones. Intenta de nuevo más tarde.');
  }

  const recommendations = (result.recommendations || []).slice(0, 3);

  if (recommendations.length === 0) {
    throw new Error('La IA no devolvió recomendaciones válidas.');
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const sourceBooks = booksWithGenres.map((b) => b.title);

  const created = await Promise.all(
    recommendations.map(async (rec) => {
      const genres = (rec.genres || [])
        .map((g: string) => g.trim())
        .filter((g: string) => VALID_GENRES.includes(g));

      return prisma.bookSuggestion.create({
        data: {
          userId,
          title: rec.title || 'Desconocido',
          author: rec.author || null,
          synopsis: rec.synopsis || null,
          reason: rec.reason || null,
          genres: genres.length > 0 ? genres : ['Ficción'],
          sourceBooks,
          status: 'suggested',
          expiresAt,
        },
      });
    }),
  );

  return created.map(mapSuggestion);
}

export async function getRecommendations(userId: string): Promise<BookSuggestionRecord[]> {
  const suggestions = await prisma.bookSuggestion.findMany({
    where: {
      userId,
      status: 'suggested',
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return suggestions.map(mapSuggestion);
}

export async function updateSuggestionStatus(
  userId: string,
  suggestionId: string,
  status: 'want_to_read' | 'dismissed',
): Promise<BookSuggestionRecord> {
  const updated = await prisma.bookSuggestion.updateMany({
    where: { id: suggestionId, userId },
    data: { status },
  });

  if (updated.count === 0) throw new Error('Suggestion not found');

  const suggestion = await prisma.bookSuggestion.findFirst({
    where: { id: suggestionId, userId },
  });

  if (!suggestion) throw new Error('Suggestion not found');
  return mapSuggestion(suggestion);
}

export async function getWishlist(userId: string): Promise<BookSuggestionRecord[]> {
  const suggestions = await prisma.bookSuggestion.findMany({
    where: { userId, status: 'want_to_read' },
    orderBy: { createdAt: 'desc' },
  });

  return suggestions.map(mapSuggestion);
}

function mapSuggestion(s: any): BookSuggestionRecord {
  return {
    id: s.id,
    user_id: s.userId,
    title: s.title,
    author: s.author,
    synopsis: s.synopsis,
    reason: s.reason,
    genres: s.genres || [],
    source_books: s.sourceBooks || [],
    status: s.status,
    expires_at: s.expiresAt.toISOString(),
    created_at: s.createdAt.toISOString(),
  };
}
