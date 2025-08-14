import Category from '../models/Category.js';

// 👉 Crear una nueva categoría
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
  }

  try {
    // Verificar si ya existe
    const exists = await Category.findOne({ where: { name } });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }

    const category = await Category.create({ name, description });
    return res.status(201).json(category);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: 'Error interno al crear la categoría' });
  }
};

// 👉 Listar todas las categorías
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error interno al obtener categorías' });
  }
};
