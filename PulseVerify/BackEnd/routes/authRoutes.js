import express from 'express';
import { verifyAndRegister } from '../controllers/authController.js';
import { checkAuth } from '../middleware/auth.js';

const router = express.Router();

// The frontend will call this after Firebase signs them in, passing the token
router.post('/verify', checkAuth, verifyAndRegister);

export default router;
