import express from 'express';
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} from '../controllers/contactController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.route('/').get(protectAdmin, getMessages).post(sendMessage);
router.route('/:id/read').put(protectAdmin, markAsRead);
router.route('/:id').delete(protectAdmin, deleteMessage);

export default router;
