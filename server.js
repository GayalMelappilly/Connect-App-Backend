import connectDB from './db/connection.js'
import dotenv from 'dotenv'
import express from 'express'
import authRouter from './routes/auth.route.js'
import session from 'express-session'
import cors from 'cors'
import passport from 'passport'
import './middlewares/passport.js'

const app = express()
dotenv.config()
const PORT = process.env.PORT || 5000


function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}


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
        maxAge: 1000 * 60 * 60,
        secure: false,
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRouter)



app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`)
})





