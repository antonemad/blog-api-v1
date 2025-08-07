const asyncErrorHandler = require("../errors/asyncErrorHandler");
const CustomError = require("../errors");
const { verifyToken } = require("../utils/jwt");

const isLogin = asyncErrorHandler(async (req, res, next) => {
  //get the token
  let token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }

  //verify the token
  try {
    const decodedUser = verifyToken(token);
    req.userId = decodedUser.id;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError(
      "Invalid/Expired token, Please login back"
    );
  }
});

module.exports = isLogin;
