const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'rahmadjon',
    password: 'ieltsmock',
    database: 'ieltsMock'
});

db.connect((err) => {
    if (err) {
        return console.log('Bazaga ulanishda xatolik 💀', err);
    }
    console.log('MariaDB bilan ulanish muvaffaqiyatli 😎');
});

module.exports = db;
