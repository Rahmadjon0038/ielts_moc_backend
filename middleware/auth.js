const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || "sirliTokenKalit";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ msg: "Token yuborilmagan" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Token noto‘g‘ri yoki muddati tugagan" });
  }
};

module.exports = verifyToken;
