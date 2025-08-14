import Supplier from '../models/Supplier.js';

// 👉 Crear proveedor
export const createSupplier = async (req, res) => {
  const { name, nit, contact, address,phone } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'El nombre del proveedor es obligatorio' });
  }

  try {
    const exists = await Supplier.findOne({ where: { name } });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe un proveedor con ese nombre' });
    }

    const supplier = await Supplier.create({ name, nit,contact, address,phone });
    return res.status(201).json(supplier);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
};

// 👉 Listar todos los proveedores
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};
