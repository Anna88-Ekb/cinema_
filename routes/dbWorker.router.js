import { Router } from 'express';
import {workerDb}  from '../controllers/dbWorker.controller.js';
const router = Router(); 
router.get('/db-list', workerDb.getTablesListForWorker);
router.get('/tables/:table', workerDb.getTableColumnName);
router.post('/tables/:table', workerDb.getTableByColumnName);
export default router;