const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())
app.use(express.json())
const authRouter = require('./routes/AuthRouter')
const userRouter = require('./routes/userRouter')
const writingRouter = require('./routes/writingRouter')
require('dotenv').config();

app.get('/', (req, res) => {
    res.json({ msg: "Ielts mock testga xush kelibsiz" })
})

// -------------------- register && login routes
app.use('/api/auth', authRouter)


// -------------------- user -------------
app.use('/api/user', userRouter)


const mockRouter = require('./routes/mockRouter');
app.use('/api/mock', mockRouter);


// ------------------- writing ----------------

app.use('/api/mock', writingRouter)



const { createWritingTable } = require('./models/writingModel');
createWritingTable(); // <-- faqat bir marta chaqiladi
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server ${PORT} - portda ishga tushdi`)
})