// Restricts access to users with one of the allowed roles
// Usage: router.delete('/:id', protect, authorize('admin'), deleteProduct)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is guaranteed to exist here because this middleware
    // always runs AFTER `protect` in the chain
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { authorize };