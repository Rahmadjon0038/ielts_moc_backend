const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())
app.use(express.json())
const authRouter = require('./routes/AuthRouter')
require('dotenv').config();

app.get('/', (req, res) => {
    res.json({ msg: "Ielts mock testga xush kelibsiz" })
})

// -------------------- register && login routes
app.use('/api/auth', authRouter)




const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server ${PORT} - portda ishga tushdi`)
})