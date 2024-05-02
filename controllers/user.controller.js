import mongoose from "mongoose";
import User from "../models/user.model.js"
import UserContactList from "../models/contact.model.js";

export const userList = async (req, res) => {
    try {
        const username = req.query.search
        console.log("USERNAME IN DB : ", username)
        const userList = await User.find({
            $or: [
                { email: { $regex: new RegExp(username, 'i') } },
                { displayName: { $regex: new RegExp(username, 'i') } }
            ]
        });
        res.status(200).json(userList)
    } catch (error) {
        console.log("ERROR IN USER CONTROLLER ", error)
        res.status(500).json({ message: 'ERROR IN USER CONTROLLER.' })
    }
}


export const addFriend = async (req, res) => {
    console.log("ADD FRIEND !!!!")
    try {
        const senderDetails = req.body.senderDetails
        const receiverDetails = req.body.receiverDetails
        console.log(senderDetails, receiverDetails)

        const senderCheck = await UserContactList.findOne({ _id: senderDetails._id })
        const receiverCheck = await UserContactList.findOne({ _id: receiverDetails._id })
        const ObjectId = mongoose.Types.ObjectId

        if (senderCheck && receiverCheck) {
            console.log("USER ALREADY EXISTS, SO UPDATING...")
            const updatedData = await UserContactList.updateOne(
                { _id: senderDetails._id },
                {
                    $addToSet: {
                        outgoingRequests: receiverDetails
                    }
                }
            )
            console.log("UPDATED DATA : ", updatedData)

            const updatedData2 = await UserContactList.updateOne(
                { _id: receiverDetails._id },
                {
                    $addToSet: {
                        incomingRequests: senderDetails
                    }
                }
            )
            console.log("UPDATED DATA 2 : ", updatedData2)

            res.status(201).json({ msg: 'UPDATED SUCCESSFULLY' })
        }

        const updatedData = await User.aggregate([
            {
                $match: {
                    _id: {
                        $in: [new ObjectId(senderDetails._id), new ObjectId(receiverDetails._id)]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    email: 1,
                    contacts: [],
                    incomingRequests: {
                        $cond: {
                            if: { $eq: ["$_id", new ObjectId(receiverDetails._id)] },
                            then: [senderDetails],
                            else: []
                        }
                    },
                    outgoingRequests: {
                        $cond: {
                            if: { $eq: ["$_id", new ObjectId(senderDetails._id)] },
                            then: [receiverDetails],
                            else: []
                        }
                    }
                }
            }
        ])

        if (!senderCheck && receiverCheck) {
            await UserContactList.updateOne(
                { _id: receiverDetails._id },
                {
                    $addToSet: {
                        incomingRequests: senderDetails
                    }
                }
            )

            await UserContactList.create(
                {
                    _id: senderDetails._id,
                    email: senderDetails.email,
                    displayName: senderDetails.displayName,
                    contacts: [],
                    incomingRequests: [],
                    outgoingRequests: [receiverDetails]
                }
            )
        }

        if (!receiverCheck && senderCheck) {
            await UserContactList.updateOne(
                { _id: senderDetails._id },
                {
                    $addToSet: {
                        outgoingRequests: receiverDetails
                    }
                }
            )

            await UserContactList.create(
                {
                    _id: receiverDetails._id,
                    email: receiverDetails.email,
                    displayName: receiverDetails.displayName,
                    contacts: [],
                    incomingRequests: [senderDetails],
                    outgoingRequests: []
                }
            )
        }

        if (!senderCheck && !receiverCheck) {
            await UserContactList.insertMany(updatedData).then((data) => {
                res.status(201).json(data)
            }).catch((err) => {
                console.log("ERROR IN ADD FRIEND : ", err)
                res.status(500).json({ message: err.message })
            })
        }
    }
    catch (error) {
        console.log("ERROR IN ADD FRIEND 2 : ", error)
        res.status(500).json({ message: error.message })
    }
}


export const requestList = async (req, res) => {

    const userId = req.query.id

    console.log("REQ LIST!!!!!")

    try {
        await UserContactList.findOne({ _id: userId }).then((data) => {
            res.status(201).json(data)
        }).catch((err) => {
            console.log("ERROR IN REQUEST LIST : ", err)
            res.status(500).json({ message: err.message })
        })
    } catch (error) {
        console.log("ERROR IN REQUEST LIST CATCH : ", error)
        res.status(500).json({ message: err.message })
    }
}


export const reqAccept = async (req, res) => {

    try {
        const sender = req.body.reqFrom
        const receiver = req.body.reqTo

        console.log("SENDER ID : ", sender._id)
        console.log("RECEIVER ID : ", receiver._id)

        await UserContactList.updateOne(
            { _id: sender._id },
            {
                $addToSet: { contacts: receiver },
                $pull: { outgoingRequests: { _id: receiver._id } }
            },
            { new: true }

        ).then((data) => {
            console.log("UPDATED DATA 1 : ", data)
        }).catch((err) => {
            console.log("ERROR IN REQ ACCEPT : ", err)
        })

        await UserContactList.updateOne(
            { _id: receiver._id },
            {
                $addToSet: { contacts: sender },
                $pull: { incomingRequests: { _id: sender._id } },
            },
            { new: true }
        ).then((data) => {
            console.log("UPDATED DATA 2 : ", data)
        }).catch((err) => {
            console.log("ERROR IN REQ ACCEPT : ", err)
        })

        console.log('REACHED HERE!')
        UserContactList.findOne({ _id: receiver._id }).then((data)=>{
            console.log("UPDATED DATA : ",data)
            res.status(201).json(data)
        })
    } catch (error) {
        console.log("ERROR IN REQ ACCEPT : ", error)
        res.status(500).json({ message: error.message })
    }
}


export const reqDecline = async (req, res) => {

    try {
        const sender = req.body.reqFrom
        const receiver = req.body.reqTo

        await UserContactList.updateOne(
            { _id: sender._id },
            { $pull: { outgoingRequests: { _id: receiver._id } } },
            { new: true }
        ).then((data) => {
            console.log("UPDATED DATA 1 : ", data)
        }).catch((err) => {
            console.log("ERROR IN REQ ACCEPT : ", err)
        })

        await UserContactList.updateOne(
            { _id: receiver._id },
            { $pull: { incomingRequests: { _id: sender._id } } },
            { new: true }
        ).then((data) => {
            console.log("UPDATED DATA 2 : ", data)
        }).catch((err) => {
            console.log("ERROR IN REQ ACCEPT : ", err)
        })

        UserContactList.findOne({ _id: receiver._id }).then((data)=>{
            console.log("UPDATED DATA : ",data)
            res.status(201).json(data)
        })
    } catch (error) {
        console.log("ERROR IN REQ DECLINE : ", error)
        res.status(500).json({ message: error.message })
    }
}


export const getContacts = async (req, res) => {
    try {
        const userId = req.body.userId
        console.log("REACHED - ID : ", userId)
        UserContactList.findOne({ _id: userId }).then((data) => {
            res.status(201).json(data)
        }).catch((err) => {
            console.log("ERROR IN GET CONTACTS : ", err)
            res.status(500).json({ message: err.message })
        })
    } catch (error) {
        console.log("ERROR IN GET CONTACTS CATCH : ", error)
        res.status(500).json({ message: error.message })
    }
}