const CustomAPIError = require("./custom-error");
const NotFoundError = require("./not-found");
const BadRequest = require("./bad-request");
const UnauthenticatedError = require("./unauthenticated");
const UnauthorizedError = require("./unauthorized");

module.exports = {
  CustomAPIError,
  NotFoundError,
  BadRequest,
  UnauthenticatedError,
  UnauthorizedError,
};
