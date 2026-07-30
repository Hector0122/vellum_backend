import { Router } from 'express';
import * as bookmarksController from '../controllers/bookmarks.controller';
import { validateBody } from '../middleware/validate';
import { createBookmarkSchema } from '../lib/validation';

const router: Router = Router({ mergeParams: true });

router.get('/', bookmarksController.listBookmarks);
router.post('/', validateBody(createBookmarkSchema), bookmarksController.createBookmark);
router.delete('/:bookmarkId', bookmarksController.deleteBookmark);

export default router;
