import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as summariesService from '../services/summaries.service';

export async function getSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const chapterIndex = parseInt(req.params.chapterIndex, 10);
    if (isNaN(chapterIndex)) {
      res.status(400).json({ error: 'chapterIndex must be a number' });
      return;
    }

    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    const result = await summariesService.summarizeChapter(
      req.userId!,
      req.params.bookId,
      chapterIndex,
      text,
    );

    res.json(result);
  } catch (err: any) {
    const status = err.message === 'Book not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}
