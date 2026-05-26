import { Router } from 'express';
import * as notesController from '../controllers/notes.controller';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', notesController.listNotes);
router.post('/', notesController.createNote);
router.delete('/:noteId', notesController.deleteNote);

export default router;
