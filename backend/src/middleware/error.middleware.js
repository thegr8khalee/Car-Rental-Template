// Error handling middleware for the car dealership API

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Sequelize validation errors
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));
  
  return new AppError(`Validation Error: ${errors.map(e => e.message).join(', ')}`, 400);
};

// Handle Sequelize unique constraint errors
const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0].path;
  const value = err.errors[0].value;
  
  return new AppError(`Duplicate value '${value}' for field '${field}'. Please use another value.`, 400);
};

// Handle Sequelize foreign key constraint errors
const handleSequelizeForeignKeyConstraintError = (err) => {
  return new AppError('Referenced record does not exist or cannot be deleted due to existing references.', 400);
};

// Handle JWT errors
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

// Handle cast errors (invalid IDs)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR:', err);
    
    res.status(500).json({
      success: false,
      message: 'Something went wrong on our end. Please try again later.'
    });
  }
};

// Main error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'SequelizeValidationError') {
      error = handleSequelizeValidationError(error);
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      error = handleSequelizeUniqueConstraintError(error);
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
      error = handleSequelizeForeignKeyConstraintError(error);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (err.name === 'CastError') {
      error = handleCastError(error);
    }

    sendErrorProd(error, res);
  }
};

// Catch async errors wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Handle 404 errors
export const notFound = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

// Rate limiting error handler
export const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000) || 60
  });
};