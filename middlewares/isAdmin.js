const User = require("../model/User");
const asyncErrorHandler = require("../errors/asyncErrorHandler");
const CustomError = require("../errors");

const isAdmin = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  //check if admin
  if (user.isAdmin) {
    return next();
  } else {
    throw new CustomError.UnauthorizedError("Access Denied, Admin Only");
  }
});

module.exports = isAdmin;
