function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    ok: false,
    error: error.message || 'Erro interno do servidor.',
  });
}

module.exports = {
  errorHandler,
};
