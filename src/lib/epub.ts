import epubParser from 'epub-parser';

// epub-parser keeps its unzipped archive in module-level variables (not passed
// through the callback), so two concurrent open()/extractBinary() calls across
// different requests can interleave and read the wrong book's data. Serialize
// all access through this queue — this also protects the existing cover
// extraction flow (cover.service.ts), which has the same underlying risk.
let queue: Promise<unknown> = Promise.resolve();

export function withEpubParserLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function openEpub(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    epubParser.open(buffer, (err: Error | null, data: any) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function normalizeHref(href: string): string {
  const withoutFragment = href.split('#')[0];
  try {
    return decodeURIComponent(withoutFragment);
  } catch {
    return withoutFragment;
  }
}

// Readium Link.href (from the frontend TOC) and epub-parser's manifest hrefs
// (opsRoot-relative) don't always agree on whether the opsRoot prefix is
// included, so try both forms.
function resolveManifestItem(epubData: any, href: string): any {
  const opsRoot: string = epubData.paths.opsRoot || '';
  const itemHashByHref = epubData.easy.itemHashByHref || {};
  const normalized = normalizeHref(href);

  const candidates =
    opsRoot && normalized.startsWith(opsRoot)
      ? [normalized, normalized.slice(opsRoot.length)]
      : [normalized, opsRoot + normalized];

  for (const candidate of candidates) {
    if (itemHashByHref[candidate]) return itemHashByHref[candidate];
  }
  return null;
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function extractChapterText(fileBuffer: Buffer, href: string): Promise<string> {
  return withEpubParserLock(async () => {
    const epubData = await openEpub(fileBuffer);
    const item = resolveManifestItem(epubData, href);
    if (!item) {
      throw new Error(`Chapter not found in EPUB manifest: ${href}`);
    }

    const opsRoot: string = epubData.paths.opsRoot || '';
    const fullHref = opsRoot + item.$.href;
    const raw = epubParser.extractBinary(fullHref);
    if (!raw) {
      throw new Error(`Failed to extract chapter content: ${href}`);
    }

    const html = Buffer.from(raw, 'binary').toString('utf-8');
    return htmlToPlainText(html);
  });
}
