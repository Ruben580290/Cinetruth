import AppDataSource from "../config/database.js";
import bcrypt from "bcryptjs";
import UserSchema from "../models/UserSchema.js";

const create = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body || {};

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: "Debes enviar firstName, lastName, email y password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La contrasena debe tener al menos 6 caracteres",
      });
    }

    const role = "user";

    const normalizedEmail = email.trim().toLowerCase();
    const userRepository = AppDataSource.getRepository(UserSchema);
    const existingUser = await userRepository.findOneBy({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Ya existe un usuario con ese email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userRepository.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    const savedUser = await userRepository.save(user);

    return res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        id: savedUser.id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
};

const getAll = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const users = await userRepository.find({
      order: { id: "ASC" },
      select: ["id", "firstName", "lastName", "email", "role", "createdAt"],
    });
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

const usersController = {
  getAll,
  create,
};

export default usersController;
