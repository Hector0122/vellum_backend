import { Router } from 'express';
import * as booksController from '../controllers/books.controller';
import { authenticate } from '../middleware/auth';
import highlightRoutes from '../routes/highlights.routes';
import noteRoutes from '../routes/notes.routes';
import bookmarkRoutes from '../routes/bookmarks.routes';
import * as summariesController from '../controllers/summaries.controller';

const router: Router = Router();

router.get('/:id/file', booksController.getBookFile); // auth via query param, no middleware

router.use(authenticate);

router.get('/search', booksController.searchBooks);
router.get('/', booksController.listBooks);
router.post('/', booksController.createBook);
router.post('/cleanup-orphans', booksController.cleanupOrphans);
router.get('/:id', booksController.getBook);
router.patch('/:id', booksController.updateBook);
router.delete('/:id', booksController.deleteBook);

router.use('/:bookId/highlights', highlightRoutes);
router.use('/:bookId/notes', noteRoutes);
router.use('/:bookId/bookmarks', bookmarkRoutes);
router.post('/:bookId/:chapterIndex/summary', summariesController.getSummary);

export default router;
