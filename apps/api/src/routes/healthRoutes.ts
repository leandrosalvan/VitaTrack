import { Router } from 'express';
import * as healthController from '../controllers/healthController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', healthController.getDashboard);

router.post('/sleep', healthController.createSleep);
router.get('/sleep', healthController.listSleep);

router.post('/activity', healthController.createActivity);
router.get('/activity', healthController.listActivity);

router.post('/heartrate', healthController.createHeartRate);
router.get('/heartrate', healthController.listHeartRate);

router.delete('/:type/:id', healthController.remove);

export default router;
