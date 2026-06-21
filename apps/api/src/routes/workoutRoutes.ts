import { Router } from 'express';
import * as workoutController from '../controllers/workoutController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', workoutController.list);
router.post('/', workoutController.create);
router.get('/volume', workoutController.getVolume);
router.get('/:id', workoutController.getById);
router.delete('/:id', workoutController.remove);

export default router;
