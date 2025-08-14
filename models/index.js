import sequelize from '../config/database.js';
// Importar modelos
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Supplier from './Supplier.js';
import InventoryMovement from './InventoryMovement.js';
import Sale from './Sale.js';
import SaleDetail from './SaleDetail.js';
import Purchase from './Purchase.js';
import PurchaseDetail from './PurchaseDetail.js';
import CashRegister from './CashRegister.js';
import Branch  from './Branch.js';
import ProductStock from './ProductStock.js';
import Transfer from './Transfer.js';
import TransferDetail from './TransferDetail.js';
import CashMovement from './CashMovement.js';



//RELACIONES

// producto a categoria
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

//prodcuto a proveedor
Supplier.hasMany(Product, { foreignKey: 'supplierId', onDelete: 'SET NULL' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId' });

//relacion  movimientos y productos
Product.hasMany(InventoryMovement, { foreignKey: 'productId' });
InventoryMovement.belongsTo(Product, { foreignKey: 'productId' });

// relacion venta usuario que la realiza
Sale.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Sale, { foreignKey: 'userId' });

// relacion ventas y detalles y ventas producto
Sale.hasMany(SaleDetail, { foreignKey: 'saleId' });
SaleDetail.belongsTo(Sale, { foreignKey: 'saleId' });

Product.hasMany(SaleDetail, { foreignKey: 'productId' });
SaleDetail.belongsTo(Product, { foreignKey: 'productId' });

// relaciones pusechase Supllier
Supplier.hasMany(Purchase, { foreignKey: 'supplierId', onDelete: 'SET NULL' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId' });

// PurchaseDetail pertenece a una Compra
PurchaseDetail.belongsTo(Purchase, { foreignKey: 'purchaseId' });
Purchase.hasMany(PurchaseDetail, { foreignKey: 'purchaseId' });

// PurchaseDetail pertenece a un Producto
PurchaseDetail.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(PurchaseDetail, { foreignKey: 'productId' });

//relaciones User Caja
User.hasMany(CashRegister, { foreignKey: 'userId' });
CashRegister.belongsTo(User, { foreignKey: 'userId' });

//relacion ventas-caja
CashRegister.hasMany(Sale, { foreignKey: 'cashRegisterId' });
Sale.belongsTo(CashRegister, { foreignKey: 'cashRegisterId' });

//relaciones compras-caja
CashRegister.hasMany(Purchase, { foreignKey: 'cashRegisterId' });
Purchase.belongsTo(CashRegister, { foreignKey: 'cashRegisterId' });


//realciones purchase-usuario
Purchase.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Purchase, { foreignKey: 'userId' });

//relacion suscrusal-usuario
  User.hasMany(Branch, {foreignKey: 'managerId',as: 'managedBranches'});
  Branch.belongsTo(User, {foreignKey: 'managerId',as: 'manager'});

  //realcion sucursal -producto
 Branch.hasMany(Product, { foreignKey: 'branchId' });
Product.belongsTo(Branch, { foreignKey: 'branchId' });

//relacion sucursal-venta
Branch.hasMany(Sale, { foreignKey: 'branchId' });
Sale.belongsTo(Branch, { foreignKey: 'branchId' });

// relacion sucursal-compras
Branch.hasMany(Purchase, { foreignKey: 'branchId' });
Purchase.belongsTo(Branch, { foreignKey: 'branchId' });

//relacion CashRegister-Sucursal
Branch.hasMany(CashRegister, { foreignKey: 'branchId' });
CashRegister.belongsTo(Branch, { foreignKey: 'branchId' });

//relacion Sucursal-InventoryMovement
Branch.hasMany(InventoryMovement, { foreignKey: 'branchId' });
InventoryMovement.belongsTo(Branch, { foreignKey: 'branchId' });

//relacion Sucursal Stock
ProductStock.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductStock, { foreignKey: 'productId', as: 'productStocks' });

ProductStock.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Branch.hasMany(ProductStock, { foreignKey: 'branchId', as: 'productStocks' });

//relacion transferencias -Sucursales-Uusarios
Transfer.belongsTo(User, { foreignKey: 'userId' });
Transfer.belongsTo(Branch, { foreignKey: 'originBranchId', as: 'originBranch' });
Transfer.belongsTo(Branch, { foreignKey: 'targetBranchId', as: 'targetBranch' });

//relaciones tranferenciasDetallles-productos
TransferDetail.belongsTo(Transfer, { foreignKey: 'transferId' });
TransferDetail.belongsTo(Product, { foreignKey: 'productId' });
Transfer.hasMany(TransferDetail, { foreignKey: 'transferId' });


//relacion movimoientos caja-usuario
CashMovement.belongsTo(User, { foreignKey: 'userId' });
CashMovement.belongsTo(CashRegister, { foreignKey: 'cashRegisterId' });

CashRegister.hasMany(CashMovement, { foreignKey: 'cashRegisterId' });







const db = {
  sequelize,
  User,
  Category,
  Product,
  Supplier,
  InventoryMovement,
  Sale,
  SaleDetail,
  Purchase,
  PurchaseDetail,
  CashRegister,
  Branch,
  ProductStock,
  Transfer,
  TransferDetail,
  CashMovement


 
};

export default db;
