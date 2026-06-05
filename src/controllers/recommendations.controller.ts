import type { Response } from 'express';
import * as recommendationsService from '../services/recommendations.service';
import type { AuthenticatedRequest } from '../types';

export async function generateRecommendations(req: AuthenticatedRequest, res: Response) {
  try {
    const suggestions = await recommendationsService.generateRecommendations(req.userId!);
    res.json({ suggestions });
  } catch (err: any) {
    const status = err.message?.includes('No tienes libros') ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function getRecommendations(req: AuthenticatedRequest, res: Response) {
  try {
    const suggestions = await recommendationsService.getRecommendations(req.userId!);
    res.json({ suggestions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSuggestionStatus(req: AuthenticatedRequest, res: Response) {
  const { status } = req.body;

  if (!status || !['want_to_read', 'dismissed'].includes(status)) {
    res.status(400).json({ error: 'status must be want_to_read or dismissed' });
    return;
  }

  try {
    const suggestion = await recommendationsService.updateSuggestionStatus(
      req.userId!,
      req.params.suggestionId,
      status,
    );
    res.json({ suggestion });
  } catch (err: any) {
    const code = err.message === 'Suggestion not found' ? 404 : 500;
    res.status(code).json({ error: err.message });
  }
}

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    const suggestions = await recommendationsService.getWishlist(req.userId!);
    res.json({ suggestions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
