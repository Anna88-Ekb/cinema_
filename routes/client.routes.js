import { Router } from 'express';
import {actionClient}  from '../controllers/client.contoller.js';
const router = Router(); 
router.post('/new-client', actionClient.addNewClient);
export default router;