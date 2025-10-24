import { Router } from 'express';
import configRouter from './config';
import healthRouter from './health';
import filesRouter from './files';
import tasksRouter from './tasks';
import videoRouter from './video';

const router = Router();

router.use('/config', configRouter);
router.use('/health', healthRouter);
router.use('/files', filesRouter);
router.use('/tasks', tasksRouter);
router.use('/video', videoRouter);

export default router;
