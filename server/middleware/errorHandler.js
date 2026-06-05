import logger from '../services/loggerService.js';

function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  const status = err.response?.status || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ 
    error: message,
    status,
    timestamp: new Date().toISOString()
  });
}

export { errorHandler };