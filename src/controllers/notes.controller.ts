import type { Response } from 'express';
import * as notesService from '../services/notes.service';
import type { AuthenticatedRequest } from '../types';

export async function listNotes(req: AuthenticatedRequest, res: Response) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const result = await notesService.listNotes(
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

export async function createNote(req: AuthenticatedRequest, res: Response) {
  const { content, highlight_id } = req.body;

  if (!content) {
    res.status(400).json({ error: 'content is required' });
    return;
  }

  try {
    const note = await notesService.createNote(req.userId!, {
      book_id: req.params.bookId,
      content,
      highlight_id,
    });
    res.status(201).json({ note });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response) {
  try {
    await notesService.deleteNote(req.userId!, req.params.noteId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateNote(req: AuthenticatedRequest, res: Response) {
  try {
    const { content, highlight_id } = req.body;

    const note = await notesService.updateNote(req.userId!, req.params.noteId, {
      content,
      highlight_id,
    });
    res.json({ note });
  } catch (err: any) {
    const status = err.message === 'Note not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function listAllNotes(req: AuthenticatedRequest, res: Response) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const result = await notesService.listAllNotes(
      req.userId!,
      parseInt(limit as string, 10) || 50,
      parseInt(offset as string, 10) || 0,
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
