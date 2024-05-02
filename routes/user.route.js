import express from 'express'
import { addFriend, requestList, userList, reqAccept, reqDecline, getContacts } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/list', userList)

router.post('/add-friend', addFriend)

router.get('/request-list', requestList)

router.put('/req-accept', reqAccept)

router.put('/req-reject', reqDecline)

router.post('/contacts', getContacts)

export default router