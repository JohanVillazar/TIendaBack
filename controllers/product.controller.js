import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import InventoryMovement from '../models/InventoryMovement.js';
import ProductStock from '../models/ProductStock.js';
import TransferDetail from '../models/TransferDetail.js';


// 👉 Crear un producto
export const createProduct = async (req, res) => {
  const {
    barcode,
    name,
    description,
    pricepuchase,
    pricesold,
    mesureunit,
    stock,
    categoryId,
    supplierId
  } = req.body;

  const branchId = req.user.branchId; 

  if (!name || !pricepuchase || !categoryId) {
    return res.status(400).json({
      message: 'Los campos name, pricepuchase y categoryId son obligatorios',
    });
  }

  try {
    const existingProduct = await Product.findOne({ where: { barcode } });
    if (existingProduct) {
      return res.status(400).json({ message: 'El código de barras ya existe' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    if (supplierId) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(404).json({ message: 'Proveedor no encontrado' });
      }
    }

    // 1. Crear el producto sin el campo 'stock'
    const product = await Product.create({
      barcode,
      name,
      description,
      pricepuchase,
      pricesold,
      mesureunit,
      categoryId,
      supplierId,
      branchId
    });

    // 2. Crear el registro de stock para la sucursal actual
    await ProductStock.create({
      productId: product.id,
      branchId,
      stock: stock || 0
    });

    return res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};



// 👉 Listar todos los productos
export const getProducts = async (req, res) => {
  const { branchId } = req.query;

  if (!branchId) {
    return res.status(400).json({ message: 'Se requiere branchId en la consulta' });
  }

  try {
    const productStocks = await ProductStock.findAll({
      where: { branchId },
      include: [
        {
          model: Product,
          as: 'product', // ← Usa el alias definido en la relación
          include: [
            {
              model: Category,
              attributes: ['id', 'name'],
            },
            {
              model: Supplier,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formatted = productStocks
      .filter(ps => ps.product) // Solo si tiene relación válida
      .map(ps => {
        const product = ps.product.toJSON();
        return {
          ...product,
          stock: ps.stock,
        };
      });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};





//Actualiza stock
export const updateProductStock = async (req, res) => {
  const { id } = req.params; // productId
  const { quantity, reference } = req.body;
  const branchId = req.user?.branchId;

  if (!branchId) {
    return res.status(400).json({ message: "Sucursal no definida para el usuario" });
  }

  if (typeof quantity !== "number") {
    return res.status(400).json({ message: "La cantidad debe ser un número" });
  }

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Buscar el registro en ProductStock por producto y sucursal
    const stockEntry = await ProductStock.findOne({
      where: { productId: id, branchId },
    });

    if (!stockEntry) {
      return res.status(404).json({ message: "No hay stock registrado para este producto en esta sucursal" });
    }

    const newStock = stockEntry.stock + quantity;

    if (newStock < 0) {
      return res.status(400).json({ message: "Stock insuficiente para esta operación" });
    }

    // Actualizar el stock en ProductStock
    stockEntry.stock = newStock;
    await stockEntry.save();

    // Registrar movimiento en el Kardex (InventoryMovement)
    await InventoryMovement.create({
      productId: product.id,
      branchId: branchId,
      quantity: Math.abs(quantity),
      type: quantity > 0 ? "entrada" : "salida",
      stockAfter: newStock,
      reference: reference || "Ajuste manual",
    });

    return res.status(200).json({
      message: "Stock actualizado correctamente",
      product: {
        id: product.id,
        name: product.name,
        newStock: newStock,
      },
    });
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    res.status(500).json({ message: "Error interno al actualizar stock" });
  }
};


//buscar por barcode 
export const getProductByBarcode = async (req, res) => {
  const { barcode } = req.params;

  try {
    const product = await Product.findOne({
      where: { barcode },
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Supplier, attributes: ['id', 'name'] },
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado con ese código de barras' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error al buscar producto por barcode:', error);
    res.status(500).json({ message: 'Error al buscar producto' });
  }
};



// borrar producto
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // 1. Eliminar detalles de traslado
    await TransferDetail.destroy({
      where: { productId: id }
    });

    // 2. Eliminar registros en product_stocks
    await ProductStock.destroy({
      where: { productId: id }
    });

    // 3. Eliminar el producto
    await product.destroy();

    return res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
}