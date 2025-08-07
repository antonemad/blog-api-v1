const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/custom-error");

const errorHandlerMiddleware = (err, req, res, next) => {
  let CustomError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went Wrong try again later",
  };
  res.status(CustomError.statusCode).json({
    msg: CustomError.message,
  });
};

module.exports = errorHandlerMiddleware;
