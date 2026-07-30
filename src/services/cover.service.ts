import epubParser from 'epub-parser';
import { getObject, uploadBuffer } from '../lib/r2';
import { withEpubParserLock, openEpub } from '../lib/epub';

export async function extractCover(
  objectKey: string,
  userId: string,
): Promise<string | null> {
  const buffer = await getObject(objectKey);

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

    const imgBuffer = Buffer.from(raw, 'binary');
    const ext = mimeType.includes('png') ? 'png' : 'jpeg';
    const coverKey = `covers/${userId}/${Date.now()}_cover.${ext}`;
    return uploadBuffer(coverKey, imgBuffer, mimeType);
  });
}
