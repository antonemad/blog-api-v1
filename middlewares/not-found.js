const notFoundMiddleware = (req, res) =>
  res.status(404).send(`${req.originalUrl} - Route does not exist`);

module.exports = notFoundMiddleware;
