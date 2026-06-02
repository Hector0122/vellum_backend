import { prisma } from '../lib/db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

  const prompt = `Summarize this book chapter in 3-5 concise bullet points in English. Focus on key ideas, events, and takeaways:\n\n${chapterText.slice(0, 15000)}`;

  try {
    const response = await fetch(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${response.status} — ${err.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No summary generated.';

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
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    throw new Error(err.message || 'Failed to generate summary');
  }
}
