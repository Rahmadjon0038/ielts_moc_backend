# 🛡️ IELTS Mock Test Backend

Bu loyiha **IELTS Mock Test Platforma**sining backend qismi bo‘lib,  
user va adminlar uchun barcha API endpointlarini taqdim etadi.  

---

## 🎯 Maqsad
- Userlarni ro‘yxatdan o‘tkazish va autentifikatsiya qilish  
- Admin tomonidan oy va testlarni boshqarish  
- Userlarning javoblarini saqlash va natijalarni hisoblash  
- Timer’ni backend orqali boshqarish (test davomiyligi saqlanadi)  
- Foydalanuvchi va admin uchun alohida funksionallarni ta’minlash  

---

## 🛠️ Texnologiyalar

- **Node.js**  
- **Express.js**  
- **Mysql**  
- **JWT Authentication**  
- **Multer** (file upload uchun, masalan audio fayllar)  

---

## 📂 Loyihaning tuzilishi
  
backend/
├── controllers/ # Logika (auth, user, admin, test, result)
├── models/ # Mongoose modellari (User, Month, Test, Answer, Result)
├── routes/ # API marshrutlari
├── middlewares/ # Auth va role tekshirish middleware
├── utils/ # Yordamchi funksiyalar (timer, validation va boshqalar)
├── uploads/ # Yuklangan fayllar (masalan audio)
├── .env # Muhit o‘zgaruvchilari
├── server.js # Asosiy server fayli


---

## ⚙️ O‘rnatish

1. Loyihani clone qilish:  
   ```bash
   git clone https://github.com/username/ielts-mock-test-backend.git
   cd ielts-mock-test-backend

