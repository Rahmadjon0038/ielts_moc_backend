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
const UntiedRouter = require('./routes/UntiedRouter')
// ----------------------- user untimed ---------------
app.use('/api/untied', UntiedRouter)



// -------------------- REDING ---------------
const readingRouter = require('./routes/readingRouter');
app.use('/api/reading', readingRouter)


// ----------------------------------Listening -----------------------------
const listeningRouter = require('./routes/listeningRouter')
app.use('/api/listening', listeningRouter)


const { createWritingTable, createWritingAnswersTable, createRaitingsTable } = require('./models/writingModel');
const { createMockTables } = require('./models/mockModel');
const { createUsersTable } = require('./models/Auth');
const { createSubmissionsTable } = require('./models/untiedModel');
const { createReadingTables } = require('./models/readingsModels');
const { createReadingAnswersTable } = require('./models/readingAnsWerModel');
const { createListeningAnswersTable } = require('./models/listeningModel');
createWritingTable(); // <-- faqat bir marta chaqiladi
createWritingAnswersTable()
createUsersTable()
createRaitingsTable()
createSubmissionsTable()  // qaysi oyda qaysi bolimni yechgani blocklash uchun
createMockTables(); // <-- faqat bir marta chaqiladi

createReadingTables()




createReadingAnswersTable()

createListeningAnswersTable()

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server ${PORT} - portda ishga tushdi`)
})