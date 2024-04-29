import express from 'express'
import { userList } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/list', userList)

export default router