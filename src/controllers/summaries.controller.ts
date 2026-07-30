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

    const { href } = req.body;

    const result = await summariesService.summarizeChapter(
      req.userId!,
      req.params.bookId,
      chapterIndex,
      href,
    );

    res.json(result);
  } catch (err: any) {
    let status = 500;
    if (err.message === 'Book not found') status = 404;
    else if (err.message.includes('not found in EPUB manifest') || err.message.includes('Failed to extract chapter content') || err.message === 'Book file not found in storage') {
      status = 422;
    } else if (err.message.includes('AI service temporarily unavailable')) {
      status = 503;
    }
    res.status(status).json({ error: err.message });
  }
}
