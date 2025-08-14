import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PurchaseDetail = sequelize.define('PurchaseDetail', {

  id:{
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  purchaseId:{
    type: DataTypes.UUID,
    allowNull: false,
    references:{
      model: 'Purchases',
      key: 'id'
    }
  },
  productId:{
    type: DataTypes.UUID,
    allowNull: false,
    references:{
      model: 'products',
      key: 'id'
    }
  },
  quantity:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pricePurchase:{
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
      createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
     updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

  
});

export default PurchaseDetail;

