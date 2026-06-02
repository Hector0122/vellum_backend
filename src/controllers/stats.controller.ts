import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as statsService from '../services/stats.service';

export async function createSession(req: AuthenticatedRequest, res: Response) {
  try {
    const { bookId, startedAt } = req.body;
    if (!bookId) {
      res.status(400).json({ error: 'bookId is required' });
      return;
    }
    const session = await statsService.createSession(
      req.userId!,
      bookId,
      startedAt || new Date().toISOString(),
    );
    res.status(201).json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function endSession(req: AuthenticatedRequest, res: Response) {
  try {
    const { endedAt, wordsRead } = req.body;
    const session = await statsService.endSession(
      req.userId!,
      req.params.sessionId,
      endedAt || new Date().toISOString(),
      wordsRead || 0,
    );
    res.json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getStreak(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await statsService.getStreak(req.userId!);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
