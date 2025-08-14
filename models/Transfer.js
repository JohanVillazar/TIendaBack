import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const Transfer = sequelize.define('Transfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  originBranchId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  targetBranchId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending', // o "pending", "cancelled" si haces lógica más compleja
  },
  observation: {
    type: DataTypes.TEXT
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }

}, {
  tableName: 'transfers',
  timestamps: true
}
);

export default Transfer;
