import express from 'express';
import {registerCashMovement} from '../controllers/cashmovement.controller.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/register', verifyToken, registerCashMovement);

export default router;