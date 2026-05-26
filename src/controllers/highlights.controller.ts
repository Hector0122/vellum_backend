import type { Response } from 'express';
import * as highlightsService from '../services/highlights.service';
import type { AuthenticatedRequest } from '../types';

export async function listHighlights(req: AuthenticatedRequest, res: Response) {
  try {
    const highlights = await highlightsService.listHighlights(
      req.userId!,
      req.params.bookId,
    );
    res.json({ highlights });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createHighlight(req: AuthenticatedRequest, res: Response) {
  const { text, location, color } = req.body;

  if (!text || !location) {
    res.status(400).json({ error: 'text and location are required' });
    return;
  }

  try {
    const highlight = await highlightsService.createHighlight(req.userId!, {
      book_id: req.params.bookId,
      text,
      location,
      color,
    });
    res.status(201).json({ highlight });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteHighlight(req: AuthenticatedRequest, res: Response) {
  try {
    await highlightsService.deleteHighlight(req.userId!, req.params.highlightId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
