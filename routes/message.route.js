import express from 'express'
import { getMessages, sendMessage } from '../controllers/message.controller.js'

const router = express.Router()

router.post('/send', sendMessage)

router.post('/get', getMessages)

export default router