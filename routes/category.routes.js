import { Router } from 'express';
import { createCategory, getCategories } from '../controllers/category.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = Router();

// Solo admins pueden crear categorías
router.post('/create', verifyToken, isAdmin, createCategory);

// Cualquier usuario autenticado puede listar
router.get('/list', verifyToken, getCategories);

export default router;
