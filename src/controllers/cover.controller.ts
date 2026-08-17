import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as booksService from '../services/books.service';
import { extractCover } from '../services/cover.service';
import { env } from '../config/env';

export async function generateCover(req: AuthenticatedRequest, res: Response) {
  const { bookId } = req.body;

  if (!bookId) {
    res.status(400).json({ error: 'bookId is required' });
    return;
  }

  try {
    const book = await booksService.getBook(req.userId!, bookId);

    if (!book.file_url) {
      res.status(400).json({ error: 'Book has no file URL' });
      return;
    }

    const objectKey = book.file_url.replace(`${env.R2_PUBLIC_URL}/`, '');

    const coverUrl = await extractCover(objectKey, req.userId!, book.file_type, book.title);

    if (!coverUrl) {
      const message =
        book.file_type === 'epub'
          ? 'No cover found in EPUB'
          : book.file_type === 'pdf'
            ? 'Could not generate a cover thumbnail for this PDF'
            : 'Could not generate a cover for this document';
      res.status(404).json({ error: message });
      return;
    }

    await booksService.updateBook(req.userId!, bookId, { cover_url: coverUrl });

    res.json({ cover_url: coverUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
