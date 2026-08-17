import { prisma } from '../lib/db';
import { callGroq, callGemini } from '../lib/ai';
import { getObject, extractObjectKey } from '../lib/r2';
import { extractChapterText } from '../lib/epub';
import * as pdfLib from '../lib/pdf';
import * as markdownLib from '../lib/markdown';

// `href` is a format-agnostic section reference: an EPUB manifest href, a
// PDF page number/range ("12" or "12-20"), or a 0-indexed Markdown heading
// section — see design.md Decision 3/4 and each lib module for the exact
// shape each format expects.
async function extractSectionText(
  fileType: 'epub' | 'pdf' | 'md',
  fileBuffer: Buffer,
  href: string,
): Promise<string> {
  try {
    if (fileType === 'epub') return await extractChapterText(fileBuffer, href);
    if (fileType === 'pdf') return await pdfLib.extractSectionText(fileBuffer, href);
    return await markdownLib.extractSectionText(fileBuffer, href);
  } catch (err: any) {
    // Covers e.g. a scanned image-only PDF with no text layer, or any other
    // extraction failure — surface a clear, actionable error instead of
    // summarizing empty/garbled text. See
    // specs/pdf-document-support/spec.md "Summary request on unextractable
    // PDF fails gracefully".
    throw new Error(
      `Could not extract text for this section: ${err.message || 'unknown extraction error'}`,
    );
  }
}

export async function summarizeChapter(
  userId: string,
  bookId: string,
  chapterIndex: number,
  href: string,
) {
  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
    select: { fileUrl: true, fileType: true },
  });
  if (!book) throw new Error('Book not found');

  const existing = await prisma.chapterSummary.findUnique({
    where: {
      bookId_chapterIndex: { bookId, chapterIndex },
    },
  });

  if (existing) {
    return { summary: existing.content, cached: true };
  }

  const objectKey = extractObjectKey(book.fileUrl);
  if (!objectKey) throw new Error('Book file not found in storage');

  const fileBuffer = await getObject(objectKey);
  const chapterText = await extractSectionText(
    book.fileType as 'epub' | 'pdf' | 'md',
    fileBuffer,
    href,
  );

  // Cover/title/blank pages extract to little or no prose — don't waste an AI
  // call (or worse, silently cache an empty/useless summary) on those.
  if (chapterText.trim().length < 200) {
    throw new Error('This page has too little text to summarize');
  }

  const prompt = `Summarize this book chapter in 3-5 concise bullet points, written in the same language as the source text below. Focus on key ideas, events, and takeaways:\n\n${chapterText.slice(0, 6000)}`;

  let groqError: string | null = null;

  try {
    const content = await callGroq(prompt);
    if (!content.trim()) throw new Error('Groq returned an empty response');

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
    if (!content.trim()) throw new Error('Gemini returned an empty response');

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
