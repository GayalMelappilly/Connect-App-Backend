import express from 'express'
import { addFriend, requestList, userList } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/list', userList)

router.post('/add-friend', addFriend)

router.get('/request-list', requestList)

export default router