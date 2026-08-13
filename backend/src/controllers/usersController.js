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
        "user.isActive",
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

/**
 * PATCH /api/users/:id/role
 * body: { role: "user" | "admin" }
 * Cambia el rol de un usuario. Solo administradores.
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        error: "El campo role debe ser 'user' o 'admin'",
      });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);
    const targetUser = await userRepository.findOneBy({ id: Number(id) });

    if (!targetUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    targetUser.role = role;
    await userRepository.save(targetUser);

    return res.json({
      message: "Rol actualizado correctamente",
      user: {
        id: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
        createdAt: targetUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    return res.status(500).json({ error: "Error al actualizar rol" });
  }
};

/**
 * PATCH /api/users/:id/status
 * body: { isActive: boolean }
 * Activa o desactiva una cuenta. Solo administradores.
 * Un admin no puede desactivarse a si mismo.
 */
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        error: "El campo isActive debe ser true o false",
      });
    }

    if (Number(id) === req.user.sub && isActive === false) {
      return res.status(400).json({
        error: "No puedes desactivar tu propia cuenta",
      });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);
    const targetUser = await userRepository.findOneBy({ id: Number(id) });

    if (!targetUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    targetUser.isActive = isActive;
    await userRepository.save(targetUser);

    return res.json({
      message: isActive
        ? "Cuenta activada correctamente"
        : "Cuenta desactivada correctamente",
      user: {
        id: targetUser.id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
        createdAt: targetUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al cambiar estado de la cuenta:", error);
    return res
      .status(500)
      .json({ error: "Error al cambiar estado de la cuenta" });
  }
};

const usersController = {
  getAll,
  create,
  updateRole,
  toggleStatus,
};

export default usersController;
