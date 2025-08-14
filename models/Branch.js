import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const Branch = sequelize.define('Branch', {
        id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    managerId: {
  type: DataTypes.UUID,
  allowNull: true,
  references: {
    model: 'users', 
    key: 'id'
  }
}
  }, {
    tableName: 'branches',
    timestamps: true
  });       



export default Branch