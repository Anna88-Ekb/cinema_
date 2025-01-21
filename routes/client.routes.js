import { Router } from 'express';
import {actionClient}  from '../controllers/client.contoller.js';
const router = Router(); 
router.post('/new-client', actionClient.addNewClient);
router.post('/search-client-mail', actionClient.checkClientMail);
router.post('/search-client-phone', actionClient.checkClientPhone);
router.post('/search-client-login', actionClient.checkClientLogin);
router.post('/entrance-client', actionClient.entranceClient);
router.post('/search-client-pass', actionClient.checkClientPass);
router.get('/preference-client-contacts', actionClient.getPreferenceClientContacts);
router.get('/client-personality-page', actionClient.personalKabinetClient);
router.get('/client-history-tickets', actionClient.clientHistoryTickets);
router.patch('/client-update', actionClient.updateClient);
router.post('/create-arenda-application', actionClient.createArendaApp);
export default router;