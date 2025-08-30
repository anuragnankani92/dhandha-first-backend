// middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || "sdfghtrtsdfgrsedgkfdgdfg";

exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ msg: "No token, unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (e) {
    return res.status(401).json({ msg: "Invalid/Expired token" });
  }
};
