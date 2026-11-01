import express from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.route('/').get(getRooms).post(protectAdmin, createRoom);
router
  .route('/:id')
  .get(getRoomById)
  .put(protectAdmin, updateRoom)
  .delete(protectAdmin, deleteRoom);

export default router;
