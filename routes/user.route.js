import express from 'express'
import { addFriend, userList } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/list', userList)

router.post('/add-friend', addFriend)

route.get('/request-list', requestList)

export default router