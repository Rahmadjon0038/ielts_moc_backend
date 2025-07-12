const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.log('Bazaga ulanishda hatolik 💀');
    console.log('Ulanish mofaqqiyatli 😎');
})
module.exports = db