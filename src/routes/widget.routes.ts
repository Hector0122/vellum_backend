import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as widgetController from '../controllers/widget.controller';

const router: Router = Router();

router.use(authenticate);

router.get('/bookmarked-books', widgetController.listBookmarkedBooks);
router.get('/book/:bookId', widgetController.getWidgetData);

export default router;
