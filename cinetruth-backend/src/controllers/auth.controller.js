import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import AppDataSource from "../config/data-source.js";
import UserSchema from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Debes enviar email y password en el body",
    });
  }

  try {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const user = await userRepository
      .createQueryBuilder("user")
      .where("LOWER(user.email) = LOWER(:email)", {
        email: email.trim(),
      })
      .getOne();

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const name = `${user.firstName} ${user.lastName}`.trim();
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "2h" },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const getProfile = (req, res) => {
  return res.json({
    user: {
      id: req.user.sub,
      name: req.user.name,
      email: req.user.email,
    },
  });
};

const authController = {
  login,
  getProfile,
};

export default authController;