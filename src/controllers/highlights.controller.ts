import type { Response } from 'express';
import * as highlightsService from '../services/highlights.service';
import type { AuthenticatedRequest } from '../types';

export async function listHighlights(req: AuthenticatedRequest, res: Response) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const result = await highlightsService.listHighlights(
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

export async function updateHighlight(req: AuthenticatedRequest, res: Response) {
  try {
    const { color } = req.body;

    const highlight = await highlightsService.updateHighlight(
      req.userId!,
      req.params.highlightId,
      { color },
    );
    res.json({ highlight });
  } catch (err: any) {
    const status = err.message === 'Highlight not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function listAllHighlights(req: AuthenticatedRequest, res: Response) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await highlightsService.listAllHighlights(
      req.userId!,
      parseInt(limit as string, 10) || 50,
      parseInt(offset as string, 10) || 0,
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
