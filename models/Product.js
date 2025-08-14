import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Category from './Category.js';

const Product = sequelize.define('Product', {
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
  barcode:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pricepuchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pricesold: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  mesureunit: {
    type: DataTypes.STRING,
    allowNull: false,

  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  supplierId: {
  type: DataTypes.UUID,
  allowNull: true,
  references: {
    model: 'suppliers',
    key: 'id'
  }
}
}, {
  tableName: 'products',
  timestamps: true,
});

export default Product;
