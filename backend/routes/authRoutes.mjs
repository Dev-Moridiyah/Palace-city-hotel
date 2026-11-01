import express from 'express';
import { loginAdmin, getMe } from '../controllers/authController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getMe);

export default router;
