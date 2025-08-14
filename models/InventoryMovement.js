// models/InventoryMovement.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';

const InventoryMovement = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
    branchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stockAfter: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING, // Ej: venta ID, compra ID, nota, etc.
    allowNull: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    }
  }
}, {
  tableName: 'inventory_movements',
  timestamps: true,
});



export default InventoryMovement;
