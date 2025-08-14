// models/CashRegister.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const CashRegister = sequelize.define('CashRegister', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId:{
    type: DataTypes.UUID,
    allowNull: false,
    references:{
      model: 'users',
      key: 'id'
    }
  },
    branchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  initialAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currentAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
  },
  isOpen: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: true
},
  openedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  salesTotal: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0
},
}, {
  tableName: 'cash_registers',
  timestamps: true,
});

export default CashRegister;
