// Manual debug script for epub-parser cover extraction against a local fixture — not wired into any npm script or CI. Run with `node scripts/debug/test-cover.mjs`.
import epubParser from 'epub-parser';
import { readFile } from 'fs/promises';

const buf = await readFile('node_modules/epub/test/fixtures/childrens-literature.epub');

epubParser.open(buf, (err, data) => {
  if (err) { console.error(err); return; }
  console.log('Cover ID:', data.easy.epub3CoverId);
  console.log('Cover URL:', data.easy.epub2CoverUrl);
  
  if (data.easy.epub3CoverId) {
    const item = data.easy.itemHashById[data.easy.epub3CoverId];
    console.log('Cover item:', JSON.stringify(item));
    const href = item.$.href;
    console.log('Cover href:', href);
    const raw = epubParser.extractBinary(data.easy.paths.opsRoot + href);
    console.log('Raw bytes:', raw?.length);
  }
});
