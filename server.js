const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())
app.use(express.json())
const authRouter = require('./routes/AuthRouter')
const userRouter = require('./routes/userRouter')
const writingRouter = require('./routes/writingRouter')
const answerUserListRouter = require('./routes/answerUserListRouter')
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

// ----------------------- asnwers user --------------------
app.use('/api/mock/users', answerUserListRouter)



const { createWritingTable,createWritingAnswersTable } = require('./models/writingModel');
createWritingTable(); // <-- faqat bir marta chaqiladi
createWritingAnswersTable()
const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server ${PORT} - portda ishga tushdi`)
})