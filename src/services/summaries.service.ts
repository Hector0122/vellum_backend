import { prisma } from '../lib/db';
import { callGroq, callGemini } from '../lib/ai';

export async function summarizeChapter(
  userId: string,
  bookId: string,
  chapterIndex: number,
  chapterText: string,
) {
  const existing = await prisma.chapterSummary.findUnique({
    where: {
      bookId_chapterIndex: { bookId, chapterIndex },
    },
  });

  if (existing) {
    return { summary: existing.content, cached: true };
  }

  const prompt = `Summarize this book chapter in 3-5 concise bullet points in English. Focus on key ideas, events, and takeaways:\n\n${chapterText.slice(0, 6000)}`;

  let groqError: string | null = null;

  try {
    const content = await callGroq(prompt);

    await prisma.chapterSummary.create({
      data: {
        userId,
        bookId,
        chapterIndex,
        content,
      },
    });

    return { summary: content, cached: false };
  } catch (err: any) {
    groqError = err.message || 'Unknown Groq error';
    console.warn(`[AI] Groq failed: ${groqError}, falling back to Gemini`);
  }

  try {
    const content = await callGemini(prompt);

    await prisma.chapterSummary.create({
      data: {
        userId,
        bookId,
        chapterIndex,
        content,
      },
    });

    return { summary: content, cached: false };
  } catch (err: any) {
    const geminiError = err.message || 'Unknown Gemini error';
    console.warn(`[AI] Gemini also failed: ${geminiError}`);
  }

  throw new Error(
    'AI service temporarily unavailable. Please try again later.',
  );
}
