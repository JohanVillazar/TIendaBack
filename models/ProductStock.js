import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductStock = sequelize.define('ProductStock', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
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
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'product_stocks',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['productId', 'branchId']
      }
    ]
  });

export default ProductStock;