import { prisma } from '../lib/db';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.2-3b-instant';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content || 'No summary generated.';
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `${GEMINI_URL}?key=${apiKey}`,
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

  return content;
}

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
