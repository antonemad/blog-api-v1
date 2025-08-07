const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const asyncErrorHandler = require("../errors/asyncErrorHandler");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils/jwt");

//register
const userRegisterCtrl = asyncErrorHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const userFound = await User.findOne({ email });
  if (userFound) {
    throw new CustomError.BadRequest(`Email Already exist`);
  }
  //create the user
  const newUser = await User.create({ firstname, lastname, email, password });

  attachCookiesToResponse({ res, user: newUser._id });
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: newUser,
  });
});

// login
const userLoginCtrl = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequest(
      `Please provide email & password for login`
    );
  }
  //check if email exist
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePasswordInDB(password))) {
    throw new CustomError.BadRequest("Wrong Credentials");
  }

  attachCookiesToResponse({ res, user: user._id });
  res.status(StatusCodes.OK).json({
    user: {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
};

module.exports = { userRegisterCtrl, userLoginCtrl };