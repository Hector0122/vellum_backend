import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import * as coverController from '../controllers/cover.controller';
import { authenticate } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimit';

const router: Router = Router();

router.use(authenticate);

router.post('/', uploadLimiter, uploadController.requestUpload);
router.post('/cover', coverController.generateCover);

export default router;
