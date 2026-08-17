import { createCanvas, DOMMatrix, DOMPoint, ImageData } from 'canvas';

// pdfjs-dist v6 ships as an ESM-only package (`build/pdf.mjs`, no CJS/legacy
// export map) and its Node "legacy" build still references browser DOM
// globals (DOMMatrix, DOMPoint, ImageData) that don't exist in plain Node.
// This backend runs as CommonJS (see tsconfig.json), so:
//  - we load it via dynamic import() (the one way CJS can consume an ESM
//    module), cached after first load;
//  - we polyfill the missing DOM globals from `canvas`, which implements
//    them natively.
// See tasks.md 1.3 / design.md's "stateless per call" note: unlike
// epub-parser, pdfjs-dist's `getDocument()` returns an isolated document
// instance per call with no shared module-level state, so no lock is needed
// here (verified: each extraction opens and destroys its own `doc`).
const globalAny = global as any;
globalAny.DOMMatrix = globalAny.DOMMatrix || DOMMatrix;
globalAny.DOMPoint = globalAny.DOMPoint || DOMPoint;
globalAny.ImageData = globalAny.ImageData || ImageData;

let pdfjsPromise: Promise<typeof import('pdfjs-dist/legacy/build/pdf.mjs')> | null = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return pdfjsPromise;
}

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(canvasAndContext: { canvas: any; context: any }, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext: { canvas: any; context: any }) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

async function openPdf(buffer: Buffer) {
  const pdfjsLib = await loadPdfjs();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    CanvasFactory: NodeCanvasFactory as any,
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  return { doc, loadingTask };
}

export async function getPageCount(buffer: Buffer): Promise<number> {
  const { doc, loadingTask } = await openPdf(buffer);
  try {
    return doc.numPages;
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * Renders the first page to a thumbnail PNG. Returns null if the PDF has no
 * pages or rendering fails on a malformed page — callers should fall back to
 * a placeholder cover rather than fail the whole upload (see
 * specs/pdf-document-support/spec.md - "Cover generation failure does not
 * block the upload").
 */
export async function extractCoverThumbnail(
  buffer: Buffer,
  maxWidth = 400,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const { doc, loadingTask } = await openPdf(buffer);
  try {
    if (doc.numPages < 1) return null;

    const page = await doc.getPage(1);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = Math.min(maxWidth / unscaledViewport.width, 2.0);
    const viewport = page.getViewport({ scale });

    const factory = new NodeCanvasFactory();
    const canvasAndContext = factory.create(viewport.width, viewport.height);
    const renderTask = page.render({
      canvasContext: canvasAndContext.context,
      viewport,
    } as any);
    await renderTask.promise;

    const pngBuffer: Buffer = canvasAndContext.canvas.toBuffer('image/png');
    factory.destroy(canvasAndContext);

    return { buffer: pngBuffer, mimeType: 'image/png' };
  } catch (err) {
    console.warn('[pdf] Cover thumbnail render failed:', (err as Error).message);
    return null;
  } finally {
    await loadingTask.destroy();
  }
}

// sectionRef is either a single 1-indexed page number ("12") or an inclusive
// page range ("12-20"), matching design.md's PDF locator shape (page-based,
// not text-offset-based).
function parseSectionRef(sectionRef: string, totalPages: number): { start: number; end: number } {
  const match = /^(\d+)(?:-(\d+))?$/.exec(sectionRef.trim());
  if (!match) {
    throw new Error(`Invalid PDF section reference: ${sectionRef}`);
  }
  const start = Math.max(1, parseInt(match[1], 10));
  const end = Math.min(totalPages, match[2] ? parseInt(match[2], 10) : start);
  if (start > totalPages || start > end) {
    throw new Error(`PDF section reference out of range: ${sectionRef}`);
  }
  return { start, end };
}

export async function extractSectionText(buffer: Buffer, sectionRef: string): Promise<string> {
  const { doc, loadingTask } = await openPdf(buffer);
  try {
    const { start, end } = parseSectionRef(sectionRef, doc.numPages);
    const pageTexts: string[] = [];

    for (let pageNum = start; pageNum <= end; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) pageTexts.push(text);
    }

    return pageTexts.join('\n\n');
  } finally {
    await loadingTask.destroy();
  }
}
