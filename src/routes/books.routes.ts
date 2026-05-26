import { Router } from 'express';
import * as booksController from '../controllers/books.controller';
import { authenticate } from '../middleware/auth';
import highlightRoutes from '../routes/highlights.routes';
import noteRoutes from '../routes/notes.routes';

const router: Router = Router();

router.get('/:id/file', booksController.getBookFile); // auth via query param, no middleware

router.use(authenticate);

router.get('/search', booksController.searchBooks);
router.get('/', booksController.listBooks);
router.post('/', booksController.createBook);
router.get('/:id', booksController.getBook);
router.patch('/:id', booksController.updateBook);
router.delete('/:id', booksController.deleteBook);

router.use('/:bookId/highlights', highlightRoutes);
router.use('/:bookId/notes', noteRoutes);

export default router;
