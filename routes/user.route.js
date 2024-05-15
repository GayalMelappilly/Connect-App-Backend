import express from 'express'
import { addFriend, requestList, userList, reqAccept, reqDecline, getContacts, inviteUser, removeFriend } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/list', userList)

router.post('/add-friend', addFriend)

router.get('/request-list', requestList)

router.put('/req-accept', reqAccept)

router.put('/req-decline', reqDecline)

router.post('/contacts', getContacts)

router.post('/invite-user', inviteUser)

router.put('/remove-friend', removeFriend)

export default router