import { Router } from 'express';
import * as bookmarksController from '../controllers/bookmarks.controller';

const router: Router = Router({ mergeParams: true });

router.get('/', bookmarksController.listBookmarks);
router.post('/', bookmarksController.createBookmark);
router.delete('/:bookmarkId', bookmarksController.deleteBookmark);

export default router;
