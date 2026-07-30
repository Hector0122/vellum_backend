import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as bookmarksService from '../services/bookmarks.service';

export async function listBookmarks(req: AuthenticatedRequest, res: Response) {
  try {
    const bookmarks = await bookmarksService.listBookmarks(
      req.userId!,
      req.params.bookId,
    );
    res.json({ bookmarks });
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
    res.status(500).json({ error: err.message });
  }
}
