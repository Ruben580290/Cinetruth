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

/**
 * GET /api/users?search=&role=
 * Listado de usuarios registrados, solo para administradores
 * (protegido con authMiddleware + adminMiddleware en users routes).
 *
 * - search: coincide contra firstName, lastName o email (case-insensitive).
 * - role: "user" | "admin", filtro exacto.
 */
const getAll = async (req, res) => {
  try {
    const { search, role } = req.query || {};

    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        error: "El parametro role debe ser 'user' o 'admin'",
      });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);
    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.role",
        "user.createdAt",
      ])
      .orderBy("user.id", "ASC");

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      queryBuilder.andWhere(
        `(user.firstName ILIKE :term OR user.lastName ILIKE :term OR user.email ILIKE :term)`,
        { term },
      );
    }

    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    const users = await queryBuilder.getMany();

    res.json({ data: users, count: users.length });
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
