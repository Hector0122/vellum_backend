import { Router } from 'express';
import * as recommendationsController from '../controllers/recommendations.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.post('/generate', recommendationsController.generateRecommendations);
router.get('/', recommendationsController.getRecommendations);
router.get('/wishlist', recommendationsController.getWishlist);
router.patch('/:suggestionId', recommendationsController.updateSuggestionStatus);

export default router;
