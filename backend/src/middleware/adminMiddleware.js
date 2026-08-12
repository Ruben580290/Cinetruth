/**
 * Permite continuar solo si el usuario autenticado tiene rol admin.
 * Se usa siempre despues de authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Esta accion es solo para administradores.",
    });
  }

  next();
};

export default adminMiddleware;
