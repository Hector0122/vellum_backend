import { marked } from 'marked';
import { createCanvas } from 'canvas';

interface Section {
  heading: string | null;
  text: string;
}

// Strip inline markdown syntax down to plain prose, similar in spirit to
// epub.ts's htmlToPlainText() but for markdown source instead of HTML.
function stripInlineMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images -> alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> label text
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Groups the document's tokens into sections split at each heading (any
// depth). Content before the first heading, if any, becomes a section with
// `heading: null`. A document with no headings at all yields a single
// section covering the whole document — see
// specs/markdown-document-support/spec.md "falls back to the whole
// document".
function sectionize(markdownText: string): Section[] {
  const tokens = marked.lexer(markdownText);
  const sections: Section[] = [];
  let current: Section = { heading: null, text: '' };
  let sawHeading = false;

  for (const token of tokens as any[]) {
    if (token.type === 'heading') {
      if (sawHeading || current.text.trim()) sections.push(current);
      sawHeading = true;
      current = { heading: token.text, text: '' };
      continue;
    }
    const raw = 'raw' in token ? token.raw : '';
    const piece = stripInlineMarkdown(raw);
    if (piece) current.text += (current.text ? '\n\n' : '') + piece;
  }
  sections.push(current);

  return sections.filter((s) => s.heading !== null || s.text.trim().length > 0);
}

export async function extractSectionText(buffer: Buffer, sectionRef?: string): Promise<string> {
  const markdownText = buffer.toString('utf-8');
  const sections = sectionize(markdownText);

  if (sections.length === 0) return '';

  // No headings (or none matched) -> summarize the whole document as one
  // section, per spec, regardless of what sectionRef asked for.
  const hasHeadings = sections.some((s) => s.heading !== null);
  if (!hasHeadings) {
    return sections.map((s) => s.text).join('\n\n').trim();
  }

  const index = sectionRef !== undefined ? parseInt(sectionRef, 10) : 0;
  const section = Number.isFinite(index) ? sections[index] : undefined;
  if (!section) {
    throw new Error(`Markdown section reference out of range: ${sectionRef}`);
  }

  const heading = section.heading ? `${section.heading}\n\n` : '';
  return (heading + section.text).trim();
}

/**
 * Markdown has no embedded cover image, so we generate a simple title-card
 * instead (see specs/markdown-document-support/spec.md and design.md
 * Decision 6) — a flat-colored card with the document title centered on it,
 * so Notes render with a real coverUrl just like every other section.
 */
export async function extractCoverThumbnail(
  title: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const width = 400;
  const height = 560; // matches the ~2:2.8 book-cover aspect used elsewhere in the library
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#4C6EF5');
  gradient.addColorStop(1, '#7048E8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 32px sans-serif';

  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  const maxWidth = width - 64;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const lineHeight = 42;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.slice(0, 6).forEach((l, i) => {
    ctx.fillText(l, width / 2, startY + i * lineHeight, maxWidth);
  });

  const pngBuffer: Buffer = canvas.toBuffer('image/png');
  return { buffer: pngBuffer, mimeType: 'image/png' };
}
