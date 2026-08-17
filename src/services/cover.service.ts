import epubParser from 'epub-parser';
import { getObject, uploadBuffer } from '../lib/r2';
import { withEpubParserLock, openEpub } from '../lib/epub';
import * as pdfLib from '../lib/pdf';
import * as markdownLib from '../lib/markdown';

async function extractEpubCover(buffer: Buffer): Promise<{ buffer: Buffer; mimeType: string } | null> {
  return withEpubParserLock(async () => {
    const epubData = await openEpub(buffer);
    const easy = epubData.easy;
    const opsRoot = epubData.paths.opsRoot || '';

    let coverHref: string | null = null;
    let mimeType = 'image/jpeg';

    if (easy.epub3CoverId) {
      const item = easy.itemHashById[easy.epub3CoverId];
      if (item) {
        coverHref = opsRoot + item.$.href;
        mimeType = item.$['media-type'] || mimeType;
      }
    }

    if (!coverHref && easy.epub2CoverUrl) {
      coverHref = easy.epub2CoverUrl;
    }

    if (!coverHref) return null;

    const raw = epubParser.extractBinary(coverHref);
    if (!raw) return null;

    return { buffer: Buffer.from(raw, 'binary'), mimeType };
  });
}

export async function extractCover(
  objectKey: string,
  userId: string,
  fileType: 'epub' | 'pdf' | 'md',
  title: string,
): Promise<string | null> {
  const buffer = await getObject(objectKey);

  const result =
    fileType === 'epub'
      ? await extractEpubCover(buffer)
      : fileType === 'pdf'
        ? await pdfLib.extractCoverThumbnail(buffer)
        : await markdownLib.extractCoverThumbnail(title);

  if (!result) return null;

  const ext = result.mimeType.includes('png') ? 'png' : 'jpeg';
  const coverKey = `covers/${userId}/${Date.now()}_cover.${ext}`;
  return uploadBuffer(coverKey, result.buffer, result.mimeType);
}
