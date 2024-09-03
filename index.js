import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
import db from "./Models/index.js";
import borrowerRouter from './routes/borrowerRouter.js'
import ownerRouter from './routes/ownerRouter.js'
const app = express()
const PORT = process.env.PORT || 3000

// middlewares for parsing body and cookies
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "*",
    methods: "GET,PATCH,POST",
    preflightContinue: false,
    optionsSuccessStatus: 204
}))
// database connection
db.sequelize.sync()
    .then(() => console.log('Database Connected'))
    .catch(e=> console.log(e.message))

// routers for borrower and owner
app.use('/borrower',borrowerRouter)
app.use('/owner',ownerRouter)

app.listen(PORT,() => console.log('server started'))