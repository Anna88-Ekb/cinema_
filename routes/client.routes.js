import { Router } from 'express';
import {actionClient}  from '../controllers/client.contoller.js';
const router = Router(); 
router.post('/new-client', actionClient.addNewClient);
router.post('/search-client-mail', actionClient.checkClientMail);
router.post('/search-client-phone', actionClient.checkClientPhone);
router.post('/search-client-login', actionClient.checkClientLogin);
export default router;