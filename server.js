import connectDB from './db/connection.js'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import passport from 'passport'
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import messageRoute from './routes/message.route.js'
import './middlewares/passport.js'

const app = express()
dotenv.config()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({
    origin: 'http://localhost:5173',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 200
}))

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false,
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/message', messageRoute)

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`)
})





