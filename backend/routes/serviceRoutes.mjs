import express from 'express';
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.mjs';
import { protectAdmin } from '../middleware/auth.mjs';

const router = express.Router();

router.route('/').get(getServices).post(protectAdmin, createService);
router
  .route('/:id')
  .put(protectAdmin, updateService)
  .delete(protectAdmin, deleteService);

export default router;
