import { Router } from 'express'; // Импортируем Router из express
import { reportingSales } from '../controllers/reportingList.controller.js'; // Импортируем reportingSales из контроллера

const router = Router(); // Создаем новый роутер

// Маршрут для получения отчетов по продажам
router.get('/reporting-sales-tickets', reportingSales.getSalesReporting);
router.get('/reporting-sales-halls', reportingSales.getHallsReporting);
router.post('/sales-report', reportingSales.getSalesReport); 
router.get('/reporting-actual-attention-halls', reportingSales.getAttentionReport); 
router.get('/reporting-actuallast-attention-halls', reportingSales.getAttentionLastReport); 
router.post('/reporting-attention-movie-reporting', reportingSales.getAttentionMovieReport); 

export default router;


