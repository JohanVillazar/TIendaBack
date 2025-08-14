import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nit:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone:{
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'suppliers',
  timestamps: true,
});

export default Supplier;
