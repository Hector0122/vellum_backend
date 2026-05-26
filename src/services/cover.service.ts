import epubParser from 'epub-parser';
import { getObject, uploadBuffer } from '../lib/r2';

export async function extractCover(
  objectKey: string,
  userId: string,
): Promise<string | null> {
  const buffer = await getObject(objectKey);

  return new Promise((resolve, reject) => {
    epubParser.open(buffer, async (err: Error | null, epubData: any) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const easy = epubData.easy;
        const paths = epubData.paths;
        const opsRoot = paths.opsRoot || '';

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

        if (!coverHref) {
          resolve(null);
          return;
        }

        const raw = epubParser.extractBinary(coverHref);
        if (!raw) {
          resolve(null);
          return;
        }

        const imgBuffer = Buffer.from(raw, 'binary');
        const ext = mimeType.includes('png') ? 'png' : 'jpeg';
        const coverKey = `covers/${userId}/${Date.now()}_cover.${ext}`;
        const publicUrl = await uploadBuffer(coverKey, imgBuffer, mimeType);

        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });
  });
}
