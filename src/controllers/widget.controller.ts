import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as widgetService from '../services/widget.service';

export async function getWidgetData(req: AuthenticatedRequest, res: Response) {
  try {
    const data = await widgetService.getWidgetData(
      req.userId!,
      req.params.bookId,
    );
    res.json(data);
  } catch (err: any) {
    const status = err.message === 'Book not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function listBookmarkedBooks(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const books = await widgetService.listBookmarkedBooks(req.userId!);
    res.json({ books });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
