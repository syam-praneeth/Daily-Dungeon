require("dotenv").config();

// Accept either MONGO_URI (existing) or MONGODB_URI (common naming) to be flexible across environments
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

module.exports = {
  mongoURI,
  jwtSecret: process.env.JWT_SECRET,
};
