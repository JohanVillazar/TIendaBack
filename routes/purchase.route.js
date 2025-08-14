import express from 'express';
import { registerPurchase,getPurchaseReport } from '../controllers/purchase.controller.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/purchasecreate', verifyToken, registerPurchase);

router.get('/report', verifyToken, getPurchaseReport);

export default router;