export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        message: "Access denied: no role found",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied",
        yourRole: userRole,
        allowedRoles,
      });
    }

    next();
  };
};