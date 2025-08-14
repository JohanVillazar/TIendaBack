import Purchase from '../models/Purchase.js';
import PurchaseDetail from '../models/PurchaseDetail.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import InventoryMovement from '../models/InventoryMovement.js';
import sequelize from '../config/database.js';
import Op from 'sequelize';
import User from '../models/User.js';
import CashRegister from '../models/CashRegister.js';
import ProductStock from  '../models/ProductStock.js'
import CashMovement from  '../models/CashMovement.js'
import { v4 as uuidv4 } from 'uuid';


// realizar compra

export const registerPurchase = async (req, res) => {
  const { supplierId, invoiceNumber, obvervation, tax, products } = req.body;

  try {
    // Validar productos
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Debe enviar al menos un producto' });
    }

    const { branchId, id: userId } = req.user;

    // Buscar caja abierta (asegurarse que el enum coincida con lo guardado en BD)
    const cashRegister = await CashRegister.findOne({
      where: { branchId, status: 'open' } // aquí usa el valor exacto del enum
    });

    if (!cashRegister) {
      return res.status(400).json({ error: 'No hay caja abierta para registrar la compra' });
    }

    // Calcular total de la compra
    let totalPurchase = 0;
    products.forEach((p) => {
      if (!p.productId || !p.quantity || !p.pricePurchase) {
        throw new Error('Datos incompletos en algún producto');
      }
      totalPurchase += Number(p.pricePurchase) * Number(p.quantity);
    });

    // Crear la compra
    const purchaseId = uuidv4();
    const purchase = await Purchase.create({
      id: purchaseId,
      supplierId,
      invoiceNumber,
      obvervation,
      tax,
      total: totalPurchase,
      branchId,
      userId,
      cashRegisterId: cashRegister.id
    });

    // Registrar detalles de compra y actualizar stock
    for (const p of products) {
      const subtotal = Number(p.pricePurchase) * Number(p.quantity);

      await PurchaseDetail.create({
        id: uuidv4(),
        purchaseId: purchase.id,
        productId: p.productId,
        quantity: p.quantity,
        pricePurchase: p.pricePurchase,
        subtotal // <- agregado para evitar notNull Violation
      });

      // Actualizar o crear stock
      const stockRow = await ProductStock.findOne({
        where: { productId: p.productId, branchId }
      });

      if (stockRow) {
        stockRow.stock = Number(stockRow.stock) + Number(p.quantity);
        await stockRow.save();
      } else {
        await ProductStock.create({
          id: uuidv4(),
          productId: p.productId,
          branchId,
          stock: p.quantity
        });
      }
    }

    // Registrar movimiento de caja como gasto
    await CashMovement.create({
      id: uuidv4(),
      cashRegisterId: cashRegister.id,
      type: 'gasto',
      description: `Compra a proveedor - Factura ${invoiceNumber}`,
      amount: totalPurchase,
      userId
    });

    res.json({ message: 'Compra registrada correctamente', purchaseId: purchase.id });
  } catch (error) {
    console.error('Error al registrar compra:', error);
    res.status(500).json({ error: error.message });
  }
};



//reporte 

export const getPurchaseReport = async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: 'Debe proporcionar las fechas "from" y "to"' });
  }

  try {
    // Forzar a hora Colombia -05:00
    const start = new Date(`${from}T00:00:00-05:00`);
    const end = new Date(`${to}T23:59:59-05:00`);

    console.log('Rango corregido:', start.toISOString(), '->', end.toISOString());

    const purchases = await Purchase.findAll({
      include: [PurchaseDetail],
     limit: 5
    });
    console.log("Compras encontradas:", purchases.length);

    let totalQuantity = 0;
    let totalAmount = 0;
    let totalTax = 0;

    const dailyTotals = {};

    for (const purchase of purchases) {
      const purchaseTotal = parseFloat(purchase.total || 0);
      const purchaseTax = parseFloat(purchase.tax || 0);

      totalAmount += purchaseTotal;
      totalTax += purchaseTax;

      for (const detail of purchase.PurchaseDetails) {
        totalQuantity += detail.quantity;
      }

      const day = purchase.createdAt.toISOString().split('T')[0];
      dailyTotals[day] = (dailyTotals[day] || 0) + purchaseTotal;
    }

    res.json({
      from,
      to,
      totalPurchases: purchases.length,
      totalQuantity,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      dailyTotals,
      purchases
    });

  } catch (error) {
    console.error('Error al generar reporte de compras:', error);
    res.status(500).json({ message: 'Error al generar reporte de compras', error: error.message });
  }
};