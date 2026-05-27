import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';

export async function track(req: AuthenticatedRequest, res: Response) {
  const { event, properties, timestamp } = req.body;

  if (!event || typeof event !== 'string') {
    res.status(400).json({ error: 'event is required' });
    return;
  }

  // Log analytics events to stdout for now
  // Future: send to a proper analytics service (PostHog, Mixpanel, etc.)
  console.log(
    JSON.stringify({
      type: 'analytics',
      userId: req.userId,
      event,
      properties: properties || {},
      timestamp: timestamp || new Date().toISOString(),
    }),
  );

  res.json({ success: true });
}
