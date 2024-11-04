import { Router } from 'express';
import {seansHall} from '../controllers/seans.controller.js';

const router = Router(); 
router.post('/hall-tickets', seansHall.getPlacesOfHall);
router.get('/min-price', seansHall.getMinPrice);
export default router;