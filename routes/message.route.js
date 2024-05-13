import express from 'express'
import { deleteMessage, getMessages, sendMessage } from '../controllers/message.controller.js'

const router = express.Router()

router.post('/send', sendMessage)

router.post('/get', getMessages)

router.put('/delete-message', deleteMessage)

export default router