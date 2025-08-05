const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'rahmadjon',
    password: 'ieltsmock',
    database: 'ieltsMock',
    waitForConnections: true,
    connectionLimit: 10, // bir vaqtning o‘zida maksimal ulanish
    queueLimit: 0        // cheksiz so‘rov navbati
});

// Ulanishni test qilish
db.getConnection((err, connection) => {
    if (err) {
        console.error('Bazaga ulanishda xatolik 💀', err);
        return;
    }
    console.log('MariaDB bilan pool orqali ulanish muvaffaqiyatli 😎');
    connection.release(); // connectionni poolga qaytarib qo‘yish
});

module.exports = db;
