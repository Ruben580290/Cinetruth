import AppDataSource from "../config/database.js";
import bcrypt from "bcryptjs";
import UserSchema from "../models/UserSchema.js";
import { runWithAuditUser } from "../utils/auditContext.js";

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
        isActive: savedUser.isActive,
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
 * Listado de usuarios registrados, solo para administradores.
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
 * Cambia el rol de un usuario. Solo administradores (adminMiddleware).
 * Queda registrado en audit_log (entityName "roles") con el admin
 * responsable, via runWithAuditUser.
 */
const updateRole = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body || {};

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "El id debe ser un entero valido" });
    }

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        error: "El campo 'role' debe ser 'user' o 'admin'",
      });
    }

    const updated = await runWithAuditUser(req.user, async (manager) => {
      const userRepository = manager.getRepository(UserSchema);
      const user = await userRepository.findOneBy({ id });

      if (!user) return null;

      user.role = role;
      return userRepository.save(user);
    });

    if (!updated) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({
      message: "Rol actualizado correctamente",
      user: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al cambiar el rol:", error);
    return res.status(500).json({ error: "Error al cambiar el rol" });
  }
};

/**
 * PATCH /api/users/:id/status
 * Activa o desactiva la cuenta de un usuario. Solo administradores.
 * Un admin no puede cambiar su propio estado.
 * Queda registrado en audit_log (entityName "usuarios") con el admin
 * responsable, via runWithAuditUser.
 */
const toggleStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isActive } = req.body || {};

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "El id debe ser un entero valido" });
    }

    if (id === req.user.sub) {
      return res.status(400).json({
        error: "No puedes desactivar o cambiar el estado de tu propia cuenta.",
      });
    }

    const updated = await runWithAuditUser(req.user, async (manager) => {
      const userRepository = manager.getRepository(UserSchema);
      const user = await userRepository.findOneBy({ id });

      if (!user) return null;

      // Si se envía un valor booleano en el body se respeta, de lo contrario se invierte el valor actual
      user.isActive = typeof isActive === "boolean" ? isActive : !user.isActive;
      return userRepository.save(user);
    });

    if (!updated) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({
      message: `Cuenta ${updated.isActive ? "activada" : "desactivada"} correctamente`,
      user: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al cambiar el estado del usuario:", error);
    return res
      .status(500)
      .json({ error: "Error al cambiar el estado del usuario" });
  }
};

const usersController = {
  getAll,
  create,
  updateRole,
  toggleStatus,
};

export default usersController;
