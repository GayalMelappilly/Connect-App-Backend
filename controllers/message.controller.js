import mongoose from 'mongoose'
import Message from '../models/Message.model.js'
import Conversation from '../models/conversation.model.js'
import { getReceiverSocketId, io } from '../socket/socket.js'

export const sendMessage = async (req, res) => {
    try {
        const senderInfo = req.body.userInfo
        const receiverInfo = req.body.messageInfo
        const message = req.body.text

        // console.log("ID R : ", receiverInfo)
        // console.log("ID S : ", senderInfo)
        const id = convertToUniqueKey(senderInfo._id, receiverInfo._id)

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
                })
            } else {
                await Conversation.create({
                    _id: id,
                    participants: [senderInfo._id, receiverInfo._id],
                    messages: newMessage._id
                })
            }
            const receiverSocketId = getReceiverSocketId(receiverInfo._id)
            const senderSocketId = getReceiverSocketId(senderInfo._id)
    
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newMessage', newMessage)
                console.log("MESSAGE EMITTED TO RECEIVER", newMessage, receiverInfo._id)
            } else {
                console.log("NO SOCKET ID FOR RECEIVER", receiverInfo._id)
            }

            if (senderSocketId) {
                // Emit the "newMessage" event to the sender
                io.to(senderSocketId).emit('newMessage', newMessage);
                console.log("MESSAGE EMITTED TO SENDER", newMessage, senderInfo._id);
            } else {
                console.log("NO SOCKET ID FOR SENDER", senderInfo._id);
            }

            res.status(201).json({ msg: "MESSAGE UPDATED SUCCESSFULLY DB." })
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
                // console.log("DATA : ", data)
                res.status(200).json(data)
            })
    } catch (error) {
        console.log("ERROR IN GETTING MESSAGES : ", error)
        res.status(500).json({ msg: error.message })
    }
}


export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.body.messageId
        const senderId = req.body.senderId
        const receiverId = req.body.receiverId

        const id = convertToUniqueKey(senderId, receiverId)

        await Conversation.updateOne({ _id: id },
            {
                $pull: { messages: messageId }
            },
            {
                new: true
            })

        await Message.deleteOne({ _id: messageId })

        res.status(201).json({ msg: "MESSAGE DELETED SUCCESSFULLY DB." })

    } catch (error) {
        console.log("ERROR IN DELETING MESSAGE : ", error)
        res.status(500).json({ msg: error.message })
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