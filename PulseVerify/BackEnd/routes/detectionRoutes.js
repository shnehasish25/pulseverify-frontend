import express from 'express';
import { detectViolation, getAllViolations, getViolationById } from '../controllers/detectController.js';
import { checkAuth } from '../middleware/auth.js';

const router = express.Router();

// All detection routes are protected
router.use(checkAuth);

router.get('/', getAllViolations);
router.get('/:id', getViolationById);
router.post('/detect', detectViolation);

export default router;
