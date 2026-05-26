import type { Response } from 'express';
import * as notesService from '../services/notes.service';
import type { AuthenticatedRequest } from '../types';

export async function listNotes(req: AuthenticatedRequest, res: Response) {
  try {
    const notes = await notesService.listNotes(req.userId!, req.params.bookId);
    res.json({ notes });
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
