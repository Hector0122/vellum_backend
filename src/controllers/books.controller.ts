import type { Response } from 'express';
import * as booksService from '../services/books.service';
import type { AuthenticatedRequest } from '../types';

export async function listBooks(req: AuthenticatedRequest, res: Response) {
  try {
    const books = await booksService.listBooks(req.userId!);
    res.json({ books });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBook(req: AuthenticatedRequest, res: Response) {
  try {
    const book = await booksService.getBook(req.userId!, req.params.id);
    res.json({ book });
  } catch (err: any) {
    const status = err.message === 'Book not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function createBook(req: AuthenticatedRequest, res: Response) {
  const { title, file_url, file_type, author, description, cover_url } = req.body;

  if (!title || !file_url || !file_type) {
    res.status(400).json({ error: 'title, file_url, and file_type are required' });
    return;
  }

  if (!['epub', 'pdf'].includes(file_type)) {
    res.status(400).json({ error: 'file_type must be "epub" or "pdf"' });
    return;
  }

  try {
    const book = await booksService.createBook(req.userId!, {
      title,
      author,
      description,
      cover_url,
      file_url,
      file_type,
    });
    res.status(201).json({ book });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateBook(req: AuthenticatedRequest, res: Response) {
  const updates = req.body;

  try {
    const book = await booksService.updateBook(
      req.userId!,
      req.params.id,
      updates,
    );
    res.json({ book });
  } catch (err: any) {
    const status = err.message === 'Book not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function deleteBook(req: AuthenticatedRequest, res: Response) {
  try {
    await booksService.deleteBook(req.userId!, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
