import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';


const Purchase = sequelize.define('Purchase', {
  id:{
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
  
  userId:{
    type: DataTypes.UUID,
    allowNull: false,
    references:{
      model: 'users',
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
  invoiceNumber:{
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de factura del proveedor',
  },
  supplierId:{
    type: DataTypes.UUID,
    allowNull: false,
    references:{
      model: 'suppliers',
      key: 'id'
    }
  },
  obvervation:
  {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Observaciones adicionales de la compra',
  },
  tax:{
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  total:{
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
  
});

export default Purchase;
