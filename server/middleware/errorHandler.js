function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const status = err.response?.status || err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

export { errorHandler };