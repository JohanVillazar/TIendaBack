import { Router } from 'express';
import { createProduct, getProducts,updateProductStock,deleteProduct,getProductByBarcode } from '../controllers/product.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = Router();

// Crear producto (solo admin)
router.post('/createproduct', verifyToken, isAdmin, createProduct);

// Listar productos (usuario autenticado)
router.get('/liststock', verifyToken, getProducts);

// Actualizar stock (solo admin)
router.patch('/updatestock/:id', verifyToken, isAdmin, updateProductStock);

// actualizar registro movimientos (solo admin)
router.patch('/:id/stock', verifyToken, isAdmin, updateProductStock);

// Eliminar producto (solo admin)
router.delete('/deleteproduct/:id', verifyToken, isAdmin, deleteProduct);

// Buscar producto por barcode (usuario autenticado)
router.get('/searchproduct/:barcode', verifyToken, getProductByBarcode);

export default router;
