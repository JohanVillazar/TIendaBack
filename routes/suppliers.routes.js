import { Router } from 'express';
import { createSupplier, getSuppliers } from '../controllers/supplier.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = Router();

// Solo administradores pueden crear proveedores
router.post('/create', verifyToken, isAdmin, createSupplier);

// Listar proveedores (requiere token)
router.get('/list', verifyToken, getSuppliers);

export default router;
