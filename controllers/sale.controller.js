import Sale from '../models/Sale.js';
import SaleDetail from '../models/SaleDetail.js';
import Product from '../models/Product.js';
import InventoryMovement from '../models/InventoryMovement.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import CashRegister from '../models/CashRegister.js';
import Branch from '../models/Branch.js';
import ProductStock from '../models/ProductStock.js';


export const createSale = async (req, res) => {
  const { clientName, applyTax = false, products } = req.body;
  const userId = req.user.id;
  const branchId = req.user.branchId;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'La venta debe incluir al menos un producto' });
  }

  try {
    // 1. Verificar caja abierta para el usuario y sucursal
    const openCashRegister = await CashRegister.findOne({
      where: {
        userId,
        branchId,
        status: 'open',
        isOpen: true
      }
    });

    if (!openCashRegister) {
      return res.status(400).json({ message: 'Debe abrir una caja antes de registrar una venta' });
    }

    let subtotal = 0.0;
    let totalUtility = 0.0;
    const saleDetails = [];

    // 2. Validar y calcular productos
    for (const item of products) {
      const { productId, quantity } = item;

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${productId}` });
      }

      // Validar stock desde ProductStock
      const productStock = await ProductStock.findOne({
        where: {
          productId: product.id,
          branchId
        }
      });

      if (!productStock || productStock.stock < quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.name}` });
      }

      const priceSold = parseFloat(product.pricesold);
      const pricePurchase = parseFloat(product.pricepuchase);
      const lineSubtotal = quantity * priceSold;
      const lineUtility = quantity * (priceSold - pricePurchase);

      subtotal += lineSubtotal;
      totalUtility += lineUtility;

      saleDetails.push({
        saleDetailData: {
          productId: product.id,
          quantity,
          priceSold,
          pricePurchase,
          subtotal: lineSubtotal,
          utility: lineUtility,
          taxApplied: applyTax
        },
        productInstance: product,
        productStockInstance: productStock
      });
    }

    const tax = applyTax ? parseFloat((subtotal * 0.19).toFixed(2)) : 0.0;
    const total = parseFloat((subtotal + tax).toFixed(2));

    // 3. Crear venta
    const sale = await Sale.create({
      clientName,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      userId,
      cashRegisterId: openCashRegister.id,
      branchId
    });

    // 4. Detalles, stock y movimiento inventario
    for (const item of saleDetails) {
      const detail = item.saleDetailData;
      const product = item.productInstance;
      const productStock = item.productStockInstance;

      await SaleDetail.create({
        ...detail,
        saleId: sale.id
      });

      // Descontar del stock en ProductStock
      productStock.stock -= detail.quantity;
      await productStock.save();

      await InventoryMovement.create({
        productId: product.id,
        quantity: detail.quantity,
        type: 'salida',
        stockAfter: productStock.stock,
        reference: `Venta ID: ${sale.id}`,
        branchId
      });
    }

    // 5. Actualizar caja
    openCashRegister.currentAmount = parseFloat(openCashRegister.currentAmount) + total;
    openCashRegister.salesTotal = parseFloat(openCashRegister.salesTotal) + total;
    await openCashRegister.save();

    // 6. Traer detalles con productos
    const saleDetailRecords = await SaleDetail.findAll({
      where: { saleId: sale.id },
      include: {
        model: Product,
        attributes: ['id', 'name', 'barcode', 'pricesold', 'pricepuchase']
      }
    });

    // 7. Respuesta
    return res.status(201).json({
      message: 'Venta registrada correctamente',
      saleId: sale.id,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      utility: parseFloat(totalUtility.toFixed(2)),
      cashRegister: {
        id: openCashRegister.id,
        currentAmount: parseFloat(openCashRegister.currentAmount),
        salesTotal: parseFloat(openCashRegister.salesTotal)
      },
      details: saleDetailRecords
    });

  } catch (error) {
    console.error('Error al registrar venta:', error);
    return res.status(500).json({ message: 'Error interno al registrar la venta' });
  }
};


// reporte por fechas


export const getSalesReport = async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      message: 'Debe proporcionar las fechas "from" y "to" en formato YYYY-MM-DD',
    });
  }

  try {
    const fromDate = new Date(`${from}T00:00:00`);
    const toDate = new Date(`${to}T23:59:59.999`);

    const sales = await Sale.findAll({
      where: {
        createdAt: {
          [Op.between]: [fromDate, toDate],
        },
      },
      include: [
        {
          model: SaleDetail,
          include: {
            model: Product,
            attributes: ['name', 'barcode'],
          },
        },
        {
          model: User,
          attributes: ['id', 'username', 'role'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Conversión segura y acumulación
    const totalAmount = sales.reduce((acc, sale) => {
      const total = parseFloat(sale.total);
      return acc + (isNaN(total) ? 0 : total);
    }, 0);

    const totalTax = sales.reduce((acc, sale) => {
      const tax = parseFloat(sale.tax);
      return acc + (isNaN(tax) ? 0 : tax);
    }, 0);

    const totalUtility = sales.reduce((acc, sale) => {
      return acc + sale.SaleDetails.reduce((sum, detail) => {
        const util = parseFloat(detail.utility);
        return sum + (isNaN(util) ? 0 : util);
      }, 0);
    }, 0);

    return res.json({
      from,
      to,
      totalSales: sales.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalUtility: parseFloat(totalUtility.toFixed(2)),
      sales,
    });
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    return res.status(500).json({ message: 'Error al generar el reporte' });
  }
};

//reporte de ventas

export const getSalesByProduct = async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ message: 'Debe proporcionar las fechas "from" y "to"' });
  }

  try {
    const sales = await Sale.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(`${from}T00:00:00`), new Date(`${to}T23:59:59`)]
        }
      },
      include: [
        {
          model: SaleDetail,
          include: {
            model: Product,
            attributes: ['id', 'name', 'barcode']
          }
        }
      ]
    });

    const productMap = {};

    sales.forEach(sale => {
      sale.SaleDetails.forEach(detail => {
        const product = detail.Product;
        const productId = product.id;

        if (!productMap[productId]) {
          productMap[productId] = {
            productId,
            name: product.name,
            barcode: product.barcode,
            totalUnits: 0,
            totalRevenue: 0,
            totalUtility: 0
          };
        }

        const quantity = parseFloat(detail.quantity) || 0;
        const priceSold = parseFloat(detail.priceSold) || 0;
        const utility = parseFloat(detail.utility) || 0;

        productMap[productId].totalUnits += quantity;
        productMap[productId].totalRevenue += quantity * priceSold;
        productMap[productId].totalUtility += utility;
      });
    });

    const products = Object.values(productMap).map(p => ({
      ...p,
      totalRevenue: parseFloat(p.totalRevenue.toFixed(2)),
      totalUtility: parseFloat(p.totalUtility.toFixed(2))
    }));

    return res.json({
      from,
      to,
      totalProducts: products.length,
      products
    });

  } catch (error) {
    console.error('Error al generar el reporte por producto:', error);
    return res.status(500).json({ message: 'Error al generar el reporte por producto' });
  }
};




