import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.route('/').get(protectAdmin, getBookings).post(createBooking);
router
  .route('/:id')
  .get(protectAdmin, getBookingById)
  .put(protectAdmin, updateBooking)
  .delete(protectAdmin, deleteBooking);

export default router;
