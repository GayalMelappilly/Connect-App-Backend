import connectDB from './db/connection.js'
import dotenv from 'dotenv'
import express from 'express'
import authRouter from './routes/auth.route.js'
import session from 'express-session'
import passport from 'passport'
import { oAuthConfig } from './middlewares/passport.js'

const app = express()
dotenv.config()
const PORT = process.env.PORT || 5000



app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}))


app.use(passport.initialize())
app.use(passport.session())

oAuthConfig()
app.use('/auth', authRouter)


passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`)
})





