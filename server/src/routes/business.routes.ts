
import express from 'express';
import { authMiddleware, isAdmin } from '../middleware/auth';
import { createBusiness } from '../controllers/business.controller';

const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createBusiness);

export default router;
// Export the router to be used in the main app
export { router as businessRoutes };
