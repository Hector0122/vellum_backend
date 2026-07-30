import { Router } from 'express';
import * as booksController from '../controllers/books.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createBookSchema, updateBookSchema, searchBooksSchema, summarizeChapterSchema } from '../lib/validation';
import highlightRoutes from '../routes/highlights.routes';
import noteRoutes from '../routes/notes.routes';
import bookmarkRoutes from '../routes/bookmarks.routes';
import * as summariesController from '../controllers/summaries.controller';

const router: Router = Router();

router.get('/:id/file', booksController.getBookFile); // auth via query param, no middleware

router.use(authenticate);

router.get('/search', validateQuery(searchBooksSchema), booksController.searchBooks);
router.get('/', booksController.listBooks);
router.post('/', validateBody(createBookSchema), booksController.createBook);
router.post('/cleanup-orphans', booksController.cleanupOrphans);
router.get('/:id', booksController.getBook);
router.patch('/:id', validateBody(updateBookSchema), booksController.updateBook);
router.delete('/:id', booksController.deleteBook);

router.use('/:bookId/highlights', highlightRoutes);
router.use('/:bookId/notes', noteRoutes);
router.use('/:bookId/bookmarks', bookmarkRoutes);
router.post(
  '/:bookId/:chapterIndex/summary',
  validateBody(summarizeChapterSchema),
  summariesController.getSummary,
);

export default router;
