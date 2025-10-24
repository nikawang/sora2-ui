import { Router } from 'express';
import { validateConfig } from '../controllers/configController';
import { validateConfigRequest } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post('/validate', validateConfigRequest, asyncHandler(validateConfig));

export default router;
