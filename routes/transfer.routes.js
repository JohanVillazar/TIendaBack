import { Router} from 'express';

import {createTransfer,acceptTransfer} from '../controllers/transfer.controller.js';
import verifyToken from '../middlewares/verifyToken.js';


const router = Router();

router.post('/createtransfer', verifyToken, createTransfer);

router.patch('/:transferId/accept', verifyToken, acceptTransfer);

export default router;