import { Router } from 'express';
import {workerAction} from '../controllers/worker.controller.js';
const router = Router(); 
router.post('/worker-access', workerAction.checkEntranceData);
router.get('/worker-name', workerAction.getWorkerPersonalFromLogin);
export default router;