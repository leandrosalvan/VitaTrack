import { Router } from 'express';
import * as routineController from '../controllers/routineController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', routineController.list);
router.post('/', routineController.create);
router.get('/:id', routineController.getById);
router.put('/:id', routineController.update);
router.delete('/:id', routineController.remove);

export default router;
