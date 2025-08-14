import CashRegister from '../models/CashRegister.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import sequelize from '../config/database.js';
import CashMovement from '../models/CashMovement.js';

export const openCashRegister = async (req, res) => {
  const { userId, initialAmount } = req.body;
  const branchId = req.user.branchId;

  if (!userId || initialAmount === undefined) {
    return res.status(400).json({ message: 'Debe proporcionar userId y initialAmount' });
  }

  try {
    // Verificar si ya hay una caja abierta por ese usuario
    const existing = await CashRegister.findOne({
      where: {
        userId,
        status: 'open',
        isOpen: true
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Ya existe una caja abierta para este usuario' });
    }

    // Crear nueva caja
    const newRegister = await CashRegister.create({
      userId,
      initialAmount,
      currentAmount: initialAmount, // inicia con el mismo valor
      openedAt: new Date(),
      status: 'open',
      isOpen: true,
      salesTotal: 0,
      branchId
    });

    res.status(201).json({
      message: 'Caja abierta exitosamente',
      cashRegister: newRegister
    });

  } catch (error) {
    console.error('Error al abrir caja:', error);
    res.status(500).json({
      message: 'Error al abrir caja',
      error: error.message
    });
  }
};

//cerrar caja


export const closeCashRegister = async (req, res) => {
  const userId = req.user.id;

  const transaction = await sequelize.transaction();

  try {
    const cashRegister = await CashRegister.findOne({
      where: { userId, isOpen: true, status: 'open' },
      include: [CashMovement],
      transaction
    });

    if (!cashRegister) {
      throw new Error('No hay una caja abierta para cerrar.');
    }

    // Obtener totales de movimientos
    const totalGastos = cashRegister.CashMovements
      .filter(m => m.type === 'gasto')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const totalIngresos = cashRegister.CashMovements
      .filter(m => m.type === 'ingreso')
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    // Obtener ventas y compras si es necesario
    const totalVentas = await Sale.sum('total', {
      where: { cashRegisterId: cashRegister.id },
      transaction
    });

    const totalCompras = await Purchase.sum('total', {
      where: { cashRegisterId: cashRegister.id },
      transaction
    });

    cashRegister.status = 'closed';
    cashRegister.isOpen = false;
    cashRegister.closedAt = new Date();

    await cashRegister.save({ transaction });
    await transaction.commit();

    res.status(200).json({
      message: 'Caja cerrada exitosamente.',
      resumen: {
        apertura: cashRegister.initialAmount,
        ingresos: totalIngresos,
        gastos: totalGastos,
        ventas: totalVentas || 0,
        compras: totalCompras || 0,
        saldoFinal: cashRegister.currentAmount
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ message: 'Error al cerrar caja', error: error.message });
  }
};

// Obtener la caja abierta actual del usuario

export const getOpenCashRegister = async (req, res) => {
  const userId = req.user.id;

  try {
    const openRegister = await CashRegister.findOne({
      where: {
        userId,
        isOpen: true,
        status: 'open',
      },
      attributes: ['id', 'initialAmount', 'currentAmount', 'createdAt'],
    });

    if (!openRegister) {
      return res.status(404).json({ message: 'No hay caja abierta' });
    }

    res.status(200).json(openRegister);
  } catch (error) {
    console.error('Error al obtener la caja abierta:', error);
    res.status(500).json({ message: 'Error al obtener caja', error: error.message });
  }
};

//getsummary
export const getCashSessionSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const cashRegister = await CashRegister.findOne({
      where: { userId, isOpen: true, status: 'open' },
    });

    if (!cashRegister) {
      return res.status(404).json({ message: 'No hay caja abierta' });
    }

    const [totalIngresos, totalGastos, totalVentas, totalTransacciones] = await Promise.all([
      CashMovement.sum('amount', {
        where: {
          cashRegisterId: cashRegister.id,
          type: 'ingreso',
        },
      }),
      CashMovement.sum('amount', {
        where: {
          cashRegisterId: cashRegister.id,
          type: 'gasto',
        },
      }),
      Sale.sum('total', {
        where: {
          cashRegisterId: cashRegister.id,
        },
      }),
      CashMovement.count({
        where: {
          cashRegisterId: cashRegister.id,
        },
      }),
    ]);

    res.json({
      totalIngresos: totalIngresos || 0,
      totalGastos: totalGastos || 0,
      totalVentas: totalVentas || 0,
      totalTransacciones: totalTransacciones || 0,
    });

  } catch (error) {
    console.error("Error al obtener resumen de caja:", error);
    res.status(500).json({ message: 'Error al obtener resumen de caja', error: error.message });
  }
};


//get sesion summary
export const getCashSessionInfo = async (req, res) => {
  const userId = req.user.id;

  try {
    const cashRegister = await CashRegister.findOne({
      where: { userId, isOpen: true, status: 'open' },
      include: [{ model: User, attributes: ['username'] }],
    });

    if (!cashRegister) {
      return res.status(404).json({ message: 'No hay caja abierta' });
    }

    const [salesCount, ingresosCount, gastosCount] = await Promise.all([
      Sale.count({ where: { cashRegisterId: cashRegister.id } }),
      CashMovement.count({
        where: {
          cashRegisterId: cashRegister.id,
          type: 'ingreso',
        },
      }),
      CashMovement.count({
        where: {
          cashRegisterId: cashRegister.id,
          type: 'gasto',
        },
      }),
    ]);

    res.json({
      cashRegisterId: cashRegister.id,
      operatorName: cashRegister.User.username,
      openTime: cashRegister.createdAt,
      salesCount,
      ingresosCount,
      gastosCount,
    });

  } catch (error) {
    console.error("Error al obtener info de sesión:", error);
    res.status(500).json({ message: 'Error al obtener info de sesión', error: error.message });
  }
};





