import  Branch  from '../models/Branch.js';
import  User  from '../models/User.js';

export const createBranch = async (req, res) => {
  const { name, address, phone, managerId } = req.body;

  // Validación básica
  if (!name) {
    return res.status(400).json({ message: 'El nombre de la sucursal es obligatorio' });
  }

  try {
    // Validar si managerId existe (opcional)
    if (managerId) {
      const manager = await User.findByPk(managerId);
      if (!manager) {
        return res.status(404).json({ message: 'El usuario managerId no existe' });
      }
    }

    // Crear la sucursal
    const newBranch = await Branch.create({
      name,
      address,
      phone,
      managerId: managerId || null
    });

    return res.status(201).json({
      message: 'Sucursal creada correctamente',
      branch: newBranch
    });

  } catch (error) {
    console.error('Error al crear sucursal:', error);
    return res.status(500).json({
      message: 'Error interno al crear la sucursal',
      error: error.message
    });
  }
};


// obtner todas las sucursales
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'username', 'email'], // Puedes agregar más campos si necesitas
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(branches);
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    return res.status(500).json({
      message: 'Error interno al obtener las sucursales',
      error: error.message,
    });
  }
};