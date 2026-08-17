import type { Response } from 'express';
import * as uploadService from '../services/upload.service';
import type { AuthenticatedRequest } from '../types';

export async function requestUpload(req: AuthenticatedRequest, res: Response) {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ error: 'fileName and fileType are required' });
    return;
  }

  if (!['epub', 'pdf', 'md'].includes(fileType)) {
    res.status(400).json({ error: 'fileType must be "epub", "pdf", or "md"' });
    return;
  }

  try {
    const result = await uploadService.requestUpload(req.userId!, fileName, fileType);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
