// Catches any error not already handled in a controller, or thrown/passed via next(err)
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    // Only expose stack traces in development — never in production
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

// Catches requests to routes that don't exist
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };