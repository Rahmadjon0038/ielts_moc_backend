const db = require('../config/db');
const fs = require("fs");
const path = require("path");
// Jadval yaratish
const createAudioTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS audios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month_id INT,
  input_index INT, -- yangi ustun, 0,1,2,3 kabi index saqlaydi
  filename VARCHAR(255),
  originalname VARCHAR(255),
  mimetype VARCHAR(100),
  size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

  `;
  db.query(query, (err) => {
    if (err) console.error("Audio jadval yaratishda xatolik:", err);
  });
};

const saveAudio = (monthId, inputIndex, file, callback) => {
    // 1️⃣ Avval eski audio borligini tekshirish
    db.query(
        'SELECT * FROM audios WHERE month_id = ? AND input_index = ?',
        [monthId, inputIndex],
        (err, results) => {
            if (err) return callback(err);

            if (results.length > 0) {
                const existingAudio = results[0];
                const filePath = path.join(__dirname, "../public/uploads/audio", existingAudio.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                db.query('DELETE FROM audios WHERE id = ?', [existingAudio.id], (err) => {
                    if (err) console.error("Eski audio o'chirishda xatolik:", err);
                });
            }

            // 2️⃣ Yangi audio saqlash
            db.query(
                'INSERT INTO audios (month_id, input_index, filename, originalname, mimetype, size) VALUES (?, ?, ?, ?, ?, ?)',
                [monthId, inputIndex, file.filename, file.originalname, file.mimetype, file.size],
                callback
            );
        }
    );
};


// Oydagi barcha audio fayllarni olish
const getAudiosByMonth = (monthId, callback) => {
  db.query(
    'SELECT * FROM audios WHERE month_id = ?',
    [monthId],
    callback
  );
};

// month bo'yicha barcha audio fayllarni o'chirish
const deleteAudiosByMonth = (monthId, callback) => {
    // 1️⃣ Avval fayllarni olish
    db.query('SELECT * FROM audios WHERE month_id = ?', [monthId], (err, results) => {
        if (err) return callback(err);

        // 2️⃣ Har bir faylni public papkadan o'chirish
        results.forEach(audio => {
            const filePath = path.join(__dirname, "../public/uploads/audio", audio.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

        // 3️⃣ Bazadan ham o'chirish
        db.query('DELETE FROM audios WHERE month_id = ?', [monthId], callback);
    });
};

module.exports = {
  createAudioTable,
  saveAudio,
  getAudiosByMonth,
  deleteAudiosByMonth
};
