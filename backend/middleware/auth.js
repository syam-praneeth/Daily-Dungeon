const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.user.id)
      .select({ _id: 1, isDeleted: 1 })
      .lean();
    if (!user || user.isDeleted) {
      return res.status(401).json({ msg: "Account is not active" });
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
