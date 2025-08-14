import express from 'express';
import {openCashRegister,closeCashRegister,getOpenCashRegister,getCashSessionSummary,getCashSessionInfo} from '../controllers/openCash.controller.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/open', verifyToken, openCashRegister);

router.post('/close', verifyToken, closeCashRegister);

router.get('/getcash', verifyToken, getOpenCashRegister);

router.get('/summary', verifyToken, getCashSessionSummary);

router.get('/get-info', verifyToken, getCashSessionInfo);

export default router;