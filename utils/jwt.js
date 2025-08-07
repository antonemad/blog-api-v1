const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: "7d",
  });
  return token;
};

const attachCookiesToResponse = ({ res, user }) => {
  const token = generateToken(user._id);
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    signed: true,
  });
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_KEY);

module.exports = {
  generateToken,
  attachCookiesToResponse,
  verifyToken,
};
