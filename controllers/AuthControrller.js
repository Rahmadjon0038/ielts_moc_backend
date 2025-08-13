const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {
  createUsersTable,
  createUser,
  findUserByUsername,
  findUserByEmail}  = require('../models/Auth')
const SECRET_KEY = process.env.JWT_SECRET || "sirliTokenKalit";

const Register = (req, res) => {
  const { username, email, password, role } = req.body;
  console.log(username,email,password,role)

  if (!username || !email || !password)
    return res.status(400).json({ msg: "All fields must be filled in." });

  findUserByEmail(email, (err, userByEmail) => {
    if (err) return res.status(500).json({ msg: "Server error" });
    if (userByEmail) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Agar role kelmasa 'user' sifatida qabul qilamiz
    createUser({ username, email, password: hashedPassword, role: role || 'user' }, (err, userId) => {
      if (err) return res.status(500).json({ msg: "Error creating user" });
      res.status(201).json({ msg: "Registration successful" });
    });
  });
};


const Login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ msg: "Please enter username and password" });

  findUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ msg: "Server error" });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ msg: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({ msg: "Login successful", token });
  });
};




module.exports = { Register, Login };
