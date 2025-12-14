const db = require('../config/db'); // pg pool ni import qilish
const fs = require("fs").promises; // ✅ fs.promises dan foydalanamiz (asenkron fayl operatsiyalari)
const path = require("path");

// Fayllar saqlanadigan joy
const UPLOADS_DIR = path.join(__dirname, "../public/uploads/audio");

// Jadvalni yaratish (o'zgarishsiz, model funksiyasi emas)
const createAudioTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS audios (
        id SERIAL PRIMARY KEY,
        month_id INT,
        input_index INT, 
        filename VARCHAR(255),
        originalname VARCHAR(255),
        mimetype VARCHAR(100),
        size INT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(query)
    .then(() => console.log("Audio jadval muvaffaqiyatli yaratildi (Postgres)."))
    .catch((err) => console.error("Audio jadval yaratishda xatolik:", err));
};


// Audio saqlash/yangilash (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const saveAudio = async (monthId, inputIndex, file) => {
    
    // 1️⃣ Avval eski audio borligini tekshirish
    const selectQuery = 'SELECT id, filename FROM audios WHERE month_id = $1 AND input_index = $2';
    
    try {
        const result = await db.query(selectQuery, [monthId, inputIndex]);
        const existingAudio = result.rows[0]; 
        
        if (existingAudio) {
            const filePath = path.join(UPLOADS_DIR, existingAudio.filename);
            
            // ✅ Faylni asinxron o'chirishga harakat qilamiz
            try {
                // fs.promises.unlink() asinxron ishlaydi
                await fs.unlink(filePath); 
            } catch (e) {
                // Agar fayl topilmasa (ENOENT), xato emas, shunchaki konsolga chiqarish
                if (e.code !== 'ENOENT') {
                    console.error("Eski audio faylni o'chirishda xatolik:", e.message);
                }
            }

            // Bazadan o'chirish
            // Bu yerda o'chirish shart emas, chunki biz keyin yangi faylni INSERT qilamiz
            // va bu yerda UNIQUE CONSTRAINT yo'q. Lekin, agar bu yerda UPSERT (ON CONFLICT) ishlatilsa yaxshiroq.
            // Eski DELETE qismini o'chirish o'rniga, biz UPDATE qilamiz, yoki DELETE/INSERT qoldiramiz:
            
            const deleteQuery = 'DELETE FROM audios WHERE id = $1';
            await db.query(deleteQuery, [existingAudio.id]);
        }

        // 2️⃣ Yangi audio saqlash
        const insertQuery = 
            'INSERT INTO audios (month_id, input_index, filename, originalname, mimetype, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        
        const values = [
            monthId, 
            inputIndex, 
            file.filename, 
            file.originalname, 
            file.mimetype, 
            file.size
        ];

        const insertResult = await db.query(insertQuery, values);
        return insertResult.rows[0].id; // Kiritilgan ID ni qaytaramiz
        
    } catch (err) {
        // Xatolikni yuqoriga uzatamiz
        throw err;
    }
};


// Oydagi barcha audio fayllarni olish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const getAudiosByMonth = async (monthId) => {
    const query = 'SELECT * FROM audios WHERE month_id = $1';
    
    try {
        const res = await db.query(query, [monthId]);
        return res.rows; // Natijalar massivini qaytaramiz
    } catch (err) {
        throw err;
    }
};

// month bo'yicha barcha audio fayllarni o'chirish (To'liq Promise/async ga o'tkazildi)
// ✅ callback argumenti olib tashlandi
const deleteAudiosByMonth = async (monthId) => {
    // 1️⃣ Avval fayllarni olish
    const selectQuery = 'SELECT filename FROM audios WHERE month_id = $1';
    
    try {
        const result = await db.query(selectQuery, [monthId]);
        const audios = result.rows;
        
        // 2️⃣ Har bir faylni public papkadan asinxron o'chirish
        const unlinkPromises = audios.map(audio => {
            const filePath = path.join(UPLOADS_DIR, audio.filename);
            // Fayl borligini tekshirish shart emas, unlink (fs.promises) xato bersa uni tutib olamiz
            return fs.unlink(filePath).catch(e => {
                if (e.code !== 'ENOENT') {
                     console.error(`Faylni o'chirishda xatolik (${audio.filename}):`, e.message);
                }
            });
        });

        // Barcha o'chirish operatsiyalari tugashini kutish
        await Promise.all(unlinkPromises);

        // 3️⃣ Bazadan ham o'chirish
        const deleteQuery = 'DELETE FROM audios WHERE month_id = $1';
        const deleteResult = await db.query(deleteQuery, [monthId]);
        
        return deleteResult.rowCount; // O'chirilgan qatorlar sonini qaytaramiz

    } catch (err) {
        throw err;
    }
};

module.exports = {
  createAudioTable,
  saveAudio,
  getAudiosByMonth,
  deleteAudiosByMonth
};