import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; // Import directo
import categoryRoutes from './routes/category.routes.js';
import supplierRoutes from './routes/suppliers.routes.js';
import productRoutes from './routes/product.routes.js';
import saleRoutes from './routes/sale.routes.js';
import purchaseRoutes from './routes/purchase.route.js';
import cashRouter from './routes/cashregister.routes.js';
import branchRouter from './routes/branch.routes.js';
import transferRouter from './routes/transfer.routes.js';
import movementRouter from './routes/movement.routes.js';


const app = express();


app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/cashregister', cashRouter);
app.use('/api/branch', branchRouter); 
app.use('/api/transfer', transferRouter);
app.use('/api/movements', movementRouter);



// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('✅ API Inventario POS en ejecución');
});

export default app;

