import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Branch from '../models/Branch.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// 👉 Registro de usuario
export const register = async (req, res) => {
  const { username, lastName, email, password, role } = req.body;

  try {
    // Verificar si ya existe un usuario con el mismo correo
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const user = await User.create({
      username,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    // Responder con los datos del usuario creado
    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// 👉 Login de usuario

export const login = async (req, res) => {
  const { email, password, branchId } = req.body;

  try {
    if (!branchId) {
      return res.status(400).json({ message: 'Debe seleccionar una sucursal' });
    }

    // Verificar existencia de la sucursal
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Comparar contraseñas
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Crear token con branchId
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
        branchId: branch.id, // 👈 importante
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Retornar información útil + token
    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        branch: {
          id: branch.id,
          name: branch.name,
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
}; 

//obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};
