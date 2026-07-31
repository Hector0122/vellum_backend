import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as bookmarksService from '../services/bookmarks.service';

export async function listBookmarks(req: AuthenticatedRequest, res: Response) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const result = await bookmarksService.listBookmarks(
      req.userId!,
      req.params.bookId,
      parseInt(limit as string, 10) || 20,
      parseInt(offset as string, 10) || 0,
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    const { cfi, label } = req.body;
    const bookmark = await bookmarksService.createBookmark(
      req.userId!,
      req.params.bookId,
      cfi,
      label,
    );
    res.status(201).json({ bookmark });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    await bookmarksService.deleteBookmark(
      req.userId!,
      req.params.bookmarkId,
    );
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message === 'Bookmark not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}
