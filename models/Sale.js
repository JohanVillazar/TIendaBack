// models/Sale.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const Sale = sequelize.define('Sale', {
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
  cashRegisterId:{
    type: DataTypes.UUID,
    allowNull: false,
    references:{
      model: 'cash_registers',
      key: 'id'
    } 
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'sales',
  timestamps: true,
});




export default Sale;
