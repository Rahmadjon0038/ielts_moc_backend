const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {
  createUsersTable, // Bu model funksiyasini kontrollerda ishlatish shart emas
  createUser,
  findUserByUsername,
  findUserByEmail
}  = require('../models/Auth');
const SECRET_KEY = process.env.JWT_SECRET || "sirliTokenKalit";

// ✅ Register (Async/await ga o'tkazildi)
const Register = async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log(username, email, password, role);

  if (!username || !email || !password)
    return res.status(400).json({ msg: "All fields must be filled in." });

  try {
    // 1. Email bo'yicha foydalanuvchini tekshirish
    // Model funksiyasi endi callback o'rniga Promise orqali user obyektini (yoki null) qaytaradi
    const userByEmail = await findUserByEmail(email); 
    if (userByEmail) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // 2. Parolni hash qilish
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 3. Foydalanuvchini yaratish
    // Model Promise orqali userId ni qaytaradi
    await createUser({ username, email, password: hashedPassword, role: role || 'user' });
    
    res.status(201).json({ msg: "Registration successful (Postgres)" });

  } catch (err) {
    console.error("Error during registration (Postgres):", err.message);
    return res.status(500).json({ msg: "Server error during registration", details: err.message });
  }
};


// ✅ Login (Async/await ga o'tkazildi)
const Login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ msg: "Please enter username and password" });

  try {
    // 1. Username bo'yicha foydalanuvchini topish
    // Model funksiyasi Promise orqali user obyektini (yoki null) qaytaradi
    const user = await findUserByUsername(username); 
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // 2. Parolni solishtirish
    // bcrypt.compareSync o'rniga, agar modelda parollar ishlashini to'g'ri boshqarsangiz, 
    // yoki bcrypt.compare (Promise) ishlatilishi mumkin, lekin bu yerda Sync qoldi
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    // 3. Token yaratish
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({ msg: "Login successful (Postgres)", token });

  } catch (err) {
    console.error("Error during login (Postgres):", err.message);
    return res.status(500).json({ msg: "Server error during login", details: err.message });
  }
};


module.exports = { Register, Login };