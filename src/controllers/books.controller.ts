import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import { s3 } from '../lib/r2';
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

export async function getBookFile(req: AuthenticatedRequest, res: Response) {
  try {
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const userId = payload.sub;

    const book = await booksService.getBook(userId, req.params.id);

    res.setHeader('Content-Type', book.file_type === 'pdf' ? 'application/pdf' : 'application/epub+zip');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', `inline; filename="${book.title}.${book.file_type}"`);

    const objectKey = book.file_url.replace(env.R2_PUBLIC_URL + '/', '');
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: objectKey,
    });

    const response = await s3.send(command);
    (response.Body as any).pipe(res);
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
