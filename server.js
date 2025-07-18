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
const path = require('path');


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

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ---------------------- raitingRoutes --------------------
const raitingRoutes = require('./routes/raitingRoutes')
app.use('/api/user', raitingRoutes)



const { createWritingTable,createWritingAnswersTable, createRaitingsTable } = require('./models/writingModel');
const { createMockTables } = require('./models/mockModel');
const { createUsersTable } = require('./models/Auth');
createWritingTable(); // <-- faqat bir marta chaqiladi
createWritingAnswersTable()
createUsersTable()
createRaitingsTable()

createMockTables(); // <-- faqat bir marta chaqiladi

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server ${PORT} - portda ishga tushdi`)
})