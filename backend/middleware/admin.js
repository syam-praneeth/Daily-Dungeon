const User = require("../models/User");

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "praneethsinguluri@gmail.com"
).toLowerCase();

module.exports = async function (req, res, next) {
  try {
    const user = await User.findById(req.user.id)
      .select({ email: 1, isDeleted: 1 })
      .lean();

    const isAdmin =
      !!user &&
      !user.isDeleted &&
      String(user.email || "").toLowerCase() === ADMIN_EMAIL;

    if (!isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    next();
  } catch (e) {
    return res.status(500).json({ msg: "Failed to verify admin" });
  }
};
