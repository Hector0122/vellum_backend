// Manual debug script for epub-parser cover extraction — not wired into any npm script or CI. Run with `node scripts/debug/test-epub-cover.mjs`.
import epubParser from 'epub-parser';
import { readFile } from 'fs/promises';

// Use any epub from a well-known public source
const resp = await fetch('https://www.gutenberg.org/cache/epub/11/pg11.epub');
const buf = Buffer.from(await resp.arrayBuffer());

epubParser.open(buf, (err, data) => {
  if (err) { console.error('Error:', err); process.exit(1); }
  const easy = data.easy;
  console.log('Title:', easy.simpleMeta?.find(m => m.title)?.title);
  console.log('Cover ID:', easy.epub3CoverId);
  console.log('Cover URL (EPUB2):', easy.epub2CoverUrl);
  
  const opsRoot = data.paths.opsRoot || '';
  if (easy.epub3CoverId) {
    const item = easy.itemHashById[easy.epub3CoverId];
    console.log('Cover item ID:', item?.$.id);
    console.log('Cover href:', item?.$.href);
    console.log('Cover mime:', item?.$['media-type']);
    
    const href = opsRoot + item.$.href;
    const raw = epubParser.extractBinary(href);
    console.log('Cover binary length:', raw?.length || 0);
    
    if (raw) {
      const buf = Buffer.from(raw, 'binary');
      console.log('Buffer length:', buf.length);
    }
  }
  
  if (easy.epub2CoverUrl) {
    console.log('EPUB2 Cover URL (full):', easy.epub2CoverUrl);
    const raw2 = epubParser.extractBinary(easy.epub2CoverUrl);
    console.log('EPUB2 Cover binary length:', raw2?.length || 0);
  }
  
  if (!easy.epub3CoverId && !easy.epub2CoverUrl) {
    console.log('No cover found');
  }
});
