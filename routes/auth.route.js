import express from 'express'
import { login, logout, signupWithGoogle, googleAuthCallback } from '../controllers/auth.controller.js'
import passport from 'passport'


const router = express.Router()

router.get('/google', signupWithGoogle)
router.get('/google/callback', googleAuthCallback)

// router.post('/signup', signup)
router.get('/login', login)
router.get('/logout', logout)


export default router
