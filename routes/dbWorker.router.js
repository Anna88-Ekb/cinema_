import { Router } from 'express';
import {workerDb}  from '../controllers/dbWorker.controller.js';
const router = Router(); 
router.get('/db-list', workerDb.getTablesListForWorker);
router.get('/tables/:table', workerDb.getTableColumnName);
router.post('/tables/:table', workerDb.getTableByColumnName);
router.get('/insert-to-table/:table/:besides?/', workerDb.getTableParametrsForCreate);
/* router.get('/insert-to-table-multiple/:table', workerDb.getTableMultipleParametrsForCreate); */
router.get('/movie-all-promotion', workerDb.getALLPromotion);
export default router;


