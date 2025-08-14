import { Router } from 'express';
import { register, login,getAllUsers } from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = Router();

// Ya está montado en /api/auth desde app.js
router.post('/register', register);
router.post('/login', login);
router.get('/users', verifyToken, getAllUsers);

export default router;

