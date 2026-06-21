import { Router } from 'express';
import * as exerciseController from '../controllers/exerciseController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', exerciseController.list);
router.post('/', exerciseController.create);
router.get('/:id', exerciseController.getById);
router.put('/:id', exerciseController.update);
router.delete('/:id', exerciseController.remove);
router.get('/:id/progress', exerciseController.getProgress);

export default router;
