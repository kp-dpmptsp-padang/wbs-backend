const crypto = require("crypto");

const generateUniqueCode = () => {
  return crypto.randomBytes(8).toString("hex");
};

module.exports = { generateUniqueCode };
