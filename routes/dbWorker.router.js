import { Router } from 'express';
import {workerDb}  from '../controllers/dbWorker.controller.js';
const router = Router(); 
router.get('/db-list', workerDb.getTablesListForWorker);
router.get('/tables/:table', workerDb.getTableColumnName);
router.get('/tables/:table', workerDb.getTableColumnName);
router.patch('/tables/:table', workerDb.getTableColumnNameForQuery);
router.post('/tables/:table', workerDb.getTableByColumnName);
router.get('/insert-to-table/:table/:besides?/', workerDb.getTableParametrsForCreate);
router.get('/movie-all-promotion', workerDb.getALLPromotion);
router.post('/insert-to-table/:table', workerDb.inserRowToTable);
router.delete('/insert-to-table/:table', workerDb.deleteRowsFromTable);
router.patch('/insert-to-table/:table', workerDb.changeRowsInTable);

export default router;


