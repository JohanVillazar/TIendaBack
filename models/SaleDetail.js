// models/SaleDetail.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const SaleDetail = sequelize.define('SaleDetail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceSold: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pricePurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  utility: {
    type: DataTypes.DECIMAL(10, 2), // Ganancia = (priceSold - pricePurchase) * cantidad
    allowNull: false,
  },
  taxApplied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'sale_details',
  timestamps: true,
});



export default SaleDetail;
