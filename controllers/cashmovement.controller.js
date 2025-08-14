// controllers/cashMovementController.js
import CashRegister from '../models/CashRegister.js';
import CashMovement from '../models/CashMovement.js';
import sequelize from '../config/database.js';

export const registerCashMovement = async (req, res) => {
  const { type, amount, description } = req.body;
  const userId = req.user.id;

  const transaction = await sequelize.transaction();

  try {
    const cashRegister = await CashRegister.findOne({
      where: { userId, isOpen: true, status: 'open' },
      transaction
    });

    if (!cashRegister) {
      throw new Error('No hay una caja abierta para registrar el movimiento.');
    }

    let currentAmount = parseFloat(cashRegister.currentAmount);
    const movementAmount = parseFloat(amount);

    if (type === 'gasto' && currentAmount < movementAmount) {
      throw new Error('Fondos insuficientes para registrar este gasto.');
    }

    // Ajustar saldo de caja
    if (type === 'gasto') {
      currentAmount -= movementAmount;
    } else if (type === 'ingreso') {
      currentAmount += movementAmount;
    } else {
      throw new Error('Tipo de movimiento inválido. Debe ser "gasto" o "ingreso".');
    }

    await CashMovement.create({
      cashRegisterId: cashRegister.id,
      userId,
      type,
      amount: movementAmount,
      description
    }, { transaction });

    cashRegister.currentAmount = currentAmount.toFixed(2);
    await cashRegister.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      message: `Movimiento de ${type} registrado correctamente.`
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar movimiento de caja:', error);
    res.status(500).json({ message: 'Error al registrar movimiento de caja', error: error.message });
  }
};
