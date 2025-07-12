const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByUsername, findUserByEmail } = require('../models/Auth');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || "sirliTokenKalit";

const Register = (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ msg: "Barcha maydonlar to‘ldirilishi kerak" });

  findUserByEmail(email, (err, userByEmail) => {
    if (err) return res.status(500).json({ msg: "Server xatolik" });
    if (userByEmail) return res.status(400).json({ msg: "Email mavjud" });

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Agar role kelmasa 'user' sifatida qabul qilamiz
    createUser({ username, email, password: hashedPassword, role: role || 'user' }, (err, userId) => {
      if (err) return res.status(500).json({ msg: "Foydalanuvchi yaratishda xato" });
      res.status(201).json({ msg: "Ro‘yxatdan o‘tish muvaffaqiyatli" });
    });
  });
};


const Login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ msg: "Username va parol kiriting" });

  findUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ msg: "Server xatolik" });
    if (!user) return res.status(400).json({ msg: "Foydalanuvchi topilmadi" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ msg: "Parol noto‘g‘ri" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res.json({ msg: "Login muvaffaqiyatli", token, user: userProfile });
  });
};



module.exports = { Register, Login };
