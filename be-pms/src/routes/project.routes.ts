import {Router} from 'express'
import projectController from '../controllers/project.controller';
const router = Router();
router.get('/summary/:id', projectController.getSummary)

export default router;