import sequelize from  '../config/database.js';

import Transfer from '../models/Transfer.js';
import TransferDetail from '../models/TransferDetail.js';
import Product from '../models/Product.js';
import ProductStock from '../models/ProductStock.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import InventoryMovement from '../models/InventoryMovement.js';


export const createTransfer = async (req, res) => {
  const { targetBranchId, observation, products } = req.body;
  const originBranchId = req.user.branchId;
  const userId = req.user.id;

  if (!targetBranchId || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos para crear el traslado.' });
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Validar y descontar stock en la sucursal de origen
    for (const item of products) {
      const { productId, quantity } = item;

      const productStock = await ProductStock.findOne({
        where: { productId, branchId: originBranchId },
        transaction
      });

      if (!productStock || productStock.stock < quantity) {
        throw new Error(`Stock insuficiente para producto ID: ${productId}`);
      }

      // Descontar stock
      productStock.stock -= quantity;
      await productStock.save({ transaction });

      // Registrar movimiento de inventario
      await InventoryMovement.create({
        productId,
        branchId: originBranchId,
        quantity,
        type: 'salida',
        stockAfter: productStock.stock,
        description: `Traslado a sucursal ID: ${targetBranchId}`
      }, { transaction });
    }

    // 2. Crear traslado
    const transfer = await Transfer.create({
      originBranchId,
      targetBranchId,
      userId,
      observation,
      status: 'pending'
    }, { transaction });

    // 3. Crear detalles del traslado
    for (const item of products) {
      const { productId, quantity } = item;

      await TransferDetail.create({
        transferId: transfer.id,
        productId,
        quantity
      }, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      message: 'Traslado creado correctamente y en espera de confirmación',
      transferId: transfer.id
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear traslado:', error);
    res.status(500).json({ message: 'Error al crear el traslado', error: error.message });
  }
};



//aceptar traslado
export const acceptTransfer = async (req, res) => {
  const { transferId } = req.params;
  const userBranchId = req.user.branchId;

  const transaction = await sequelize.transaction();

  try {
    // Buscar el traslado y sus detalles
    const transfer = await Transfer.findByPk(transferId, {
      include: [TransferDetail],
      transaction
    });

    if (!transfer) {
      return res.status(404).json({ message: 'Traslado no encontrado' });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({ message: 'El traslado ya fue procesado' });
    }

    if (transfer.targetBranchId !== userBranchId) {
      return res.status(403).json({ message: 'No tiene permiso para aceptar este traslado' });
    }

    // Procesar cada producto en el traslado
    for (const detail of transfer.TransferDetails) {
      const { productId, quantity } = detail;

      // ↓↓↓ Restar stock en la sucursal origen ↓↓↓
      const originStock = await ProductStock.findOne({
        where: {
          productId,
          branchId: transfer.originBranchId
        },
        transaction
      });

      if (!originStock || originStock.stock < quantity) {
        throw new Error(`Stock insuficiente en la sucursal de origen para producto ID: ${productId}`);
      }

      originStock.stock -= quantity;
      await originStock.save({ transaction });

      // Registrar movimiento de salida
      await InventoryMovement.create({
        productId,
        branchId: transfer.originBranchId,
        quantity,
        type: 'salida',
        stockAfter: originStock.stock,
        description: `Traslado a sucursal ${transfer.targetBranchId} (Transferencia ID: ${transfer.id})`
      }, { transaction });

      // ↓↓↓ Sumar stock en la sucursal destino ↓↓↓
      const [destStock] = await ProductStock.findOrCreate({
        where: {
          productId,
          branchId: transfer.targetBranchId
        },
        defaults: { stock: 0 },
        transaction
      });

      destStock.stock += quantity;
      await destStock.save({ transaction });

      // Registrar movimiento de entrada
      await InventoryMovement.create({
        productId,
        branchId: transfer.targetBranchId,
        quantity,
        type: 'entrada',
        stockAfter: destStock.stock,
        description: `Recepción de traslado desde sucursal ${transfer.originBranchId} (Transferencia ID: ${transfer.id})`
      }, { transaction });
    }

    // Marcar el traslado como completado
    transfer.status = 'completed';
    await transfer.save({ transaction });

    await transaction.commit();

    res.status(200).json({ message: 'Traslado aceptado correctamente' });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al aceptar traslado:', error);
    res.status(500).json({ message: 'Error al aceptar traslado', error: error.message });
  }
};
