// src/routes/cycle.routes.ts

import express from 'express';
import { createCycle, closeCycle } from '../controllers/cycle.controller';
import { authMiddleware, isAdmin } from '../middleware/auth';

const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createCycle);
router.patch('/close/:cycleId', authMiddleware, isAdmin, closeCycle);

export default router;
