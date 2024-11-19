import { Router } from 'express';
import {seansHall} from '../controllers/seans.controller.js';

const router = Router(); 
router.post('/hall-tickets', seansHall.getPlacesOfHall);
router.get('/min-price', seansHall.getMinPrice);
router.post('/seance-promotion', seansHall.getSeansSales);
router.get('/seance-basic-price', seansHall.getSeansBasicPrice);
router.post('/buy-ticket-confirm', seansHall.createTransactAndTicket);
export default router;