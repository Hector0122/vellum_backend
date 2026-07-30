import { Router } from 'express';
import * as notesController from '../controllers/notes.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createNoteSchema, updateNoteSchema } from '../lib/validation';

const router: Router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', notesController.listNotes);
router.post('/', validateBody(createNoteSchema), notesController.createNote);
router.patch('/:noteId', validateBody(updateNoteSchema), notesController.updateNote);
router.delete('/:noteId', notesController.deleteNote);

export default router;
