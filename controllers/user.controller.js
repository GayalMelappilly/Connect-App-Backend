import mongoose from "mongoose";
import User from "../models/user.model.js"

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
    try {
        const senderId = req.body.senderId
        const receiverId = req.body.receiverId
        console.log(senderId, receiverId)

        const ObjectId = mongoose.Types.ObjectId

        User.aggregate([
            {
                $match: {
                    _id: {
                        $in: [new ObjectId(senderId), new ObjectId(receiverId)]
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
                            if: { $eq: ["$_id",new ObjectId(receiverId)] },
                            then: [{ _id: senderId }],
                            else: []
                        }
                    },
                    outgoingRequests: {
                        $cond: {
                            if: { $eq: ["$_id",new ObjectId(senderId)] },
                            then: [{ _id: receiverId }],
                            else: []
                        }
                    }
                }
            },
            {
                $out: 'user-contact-list'
            }
        ]).exec().then((data) => {
            console.log("AFTER AGGREGATION : ", data);
        }).catch((err) => {
            console.error("Error during aggregation:", err);
        });

    }
    catch (error) {
        console.log("ERROR IN ADD FRIEND : ", error)
    }
}