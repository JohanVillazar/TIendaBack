import express from 'express';
import { createSale,getSalesReport,getSalesByProduct } from '../controllers/sale.controller.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/salescreate', verifyToken, createSale);

router.get('/report', verifyToken, getSalesReport);

router.get('/salesbyproduct', verifyToken, getSalesByProduct);



export default router;
