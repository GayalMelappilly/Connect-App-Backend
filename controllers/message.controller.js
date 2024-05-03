import mongoose from 'mongoose'
import Message from '../models/Message.model.js'
import Conversation from '../models/conversation.model.js'

export const sendMessage = async (req, res) => {

    try {
        const senderInfo = req.body.userInfo
        const receiverInfo = req.body.messageInfo
        const message = req.body.text

        const id = convertToUniqueKey(senderInfo._id, receiverInfo._id)
        console.log("ID : ", id)

        const convoCheck = await Conversation.findOne({ _id: id })

        const newMessage = await Message.create({
            senderId: senderInfo._id,
            receiverId: receiverInfo._id,
            message: message
        })

        if (convoCheck) {

            await Conversation.updateOne({ _id: id },
                {
                    $push: { messages: newMessage._id }
                },
                {
                    new: true
                }).then((data) => {
                    console.log("MESSAGE ADD TO EXISTING DOCUMENT", data)
                    res.status(201).json({ msg: "MESSAGE ADD TO EXISTING DOCUMENT" })
                }).catch((err) => {
                    console.log("ERROR IN ADDING MESSAGE TO EXISTING DOCUMENT", err)
                    res.status(500).json({ msg: "ERROR IN ADDING MESSAGE TO EXISTING DOCUMENT" })
                })
        } else {
            await Conversation.create({
                _id: id,
                participants: [senderInfo._id, receiverInfo._id],
                messages: newMessage._id
            }).then((data) => {
                console.log("CONVERSATION CREATED", data)
                res.status(201).json({ msg: "CONVERSATION CREATED" })
            }).catch((err) => {
                console.log("ERROR IN CREATING CONVERSATION", err)
                res.status(500).json({ msg: "ERROR IN CREATING CONVERSATION" })
            })
        }
    } catch (error) {
        console.log("ERROR IN SENDING MESSAGE : ", error)
        res.status(500).json({ msg: error.message })
    }

}

export const getMessages = async (req, res) => {
    try {
        console.log("REACHED GET MESSAGES!!")
        const senderId = req.body.senderId
        const receiverId = req.body.receiverId

        const id = convertToUniqueKey(senderId, receiverId)

        Conversation.findOne({ _id: id })
            .populate('messages')
            .then((data) => {
                console.log("DATA : ", data)
                res.status(200).json(data)
            })
    } catch (error) {

    }
}






const convertToUniqueKey = (senderId, receiverId) => {
    const uniqueSenderId = BigInt(`0x${senderId}`).toString()
    const uniqueReceiverId = BigInt(`0x${receiverId}`).toString()
    console.log(uniqueSenderId, uniqueReceiverId)

    if (uniqueSenderId > uniqueReceiverId) {
        console.log('SENDER IS GREATER')
        const id = uniqueSenderId + uniqueReceiverId
        return id

    }
    else {
        console.log('RECEIVER IS GREATER')
        const id = uniqueReceiverId + uniqueSenderId
        return id
    }

}