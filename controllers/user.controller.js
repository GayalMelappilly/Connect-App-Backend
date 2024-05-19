import mongoose from "mongoose";
import User from "../models/user.model.js"
import UserContactList from "../models/contact.model.js";
import nodeMailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config()

export const userList = async (req, res) => {
    try {
        const username = req.query.search
        const userId = req.query.id
        console.log("USERNAME IN DB : ", username)
        console.log("USER ID : ", userId)
        const userList = await User.find({
            $and: [
                {
                    $or: [
                        { email: { $regex: new RegExp(username, 'i') } },
                        { displayName: { $regex: new RegExp(username, 'i') } }
                    ]
                },
                { _id: { $ne: userId } }
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
            // console.log("UPDATED DATA : ", updatedData)

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

        const updatedSender = await UserContactList.updateOne(
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

        const updatedReceiver = await UserContactList.updateOne(
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
        UserContactList.findOne({ _id: receiver._id }).then((data) => {
            console.log("UPDATED DATA : ", data)
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

        const updatedSender = await UserContactList.updateOne(
            { _id: sender._id },
            { $pull: { outgoingRequests: { _id: receiver._id } } },
            { new: true }
        ).then((data) => {
            console.log("UPDATED DATA 1 : ", data)
        }).catch((err) => {
            console.log("ERROR IN REQ ACCEPT : ", err)
        })

        const updatedReceiver = await UserContactList.updateOne(
            { _id: receiver._id },
            { $pull: { incomingRequests: { _id: sender._id } } },
            { new: true }
        ).then((data) => {
            console.log("UPDATED DATA 2 : ", data)
        }).catch((err) => {
            console.log("ERROR IN REQ ACCEPT : ", err)
        })

        UserContactList.findOne({ _id: receiver._id }).then((data) => {
            console.log("UPDATED DATA : ", data)
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

export const inviteUser = async (req, res) => {

    const email = req.body.email
    const user = req.body.user

    const username = email.split('@');

    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_ACCOUNT_ID,
            pass: process.env.GMAIL_ACCOUNT_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_ACCOUNT_ID,
        to: email,
        subject: 'Invitation to Join Connect - Say it with Connect',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="background-color: #f9f9f9; color: #333; margin: 0; padding: 0; font-family: Arial, sans-serif;">
                <div style="width: 100%; padding: 20px;">
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 0 auto;">
                        <div style="text-align: center; border-bottom: 1px solid #eaeaea; padding-bottom: 10px; margin-bottom: 20px;">
                            <h1 style="margin: 0; color: #1a202c;">You're Invited to Join Connect!</h1>
                        </div>
                        <p>Dear ${username[0]},</p>
                        <p>You have been personally invited by <strong>${user.displayName}</strong> (<a href="mailto:${user.email}" style="color: #38b2ac;">${user.email}</a>) to join Connect.</p>
                        <p>Connect is a platform where you can chat, collaborate, and stay connected effortlessly.</p>
                        <p>To accept the invitation and join our community, please click the button below:</p>
                        <a href="http://localhost:5173/" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #38b2ac; color: #fff; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                        <p>We look forward to seeing you online and helping you connect, chat, and collaborate with ease!</p>
                        <p>Best regards,<br>Connect Team</p>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
                        <p>&copy; ${new Date().getFullYear()} Connect. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred:', error);
            res.status(500).send('Error occurred while sending email.');
        } else {
            console.log('Email sent:', info.response);
            res.send('Email sent successfully.');
        }
    });
}

export const removeFriend = async (req, res) => {

    try {
        const user = req.body.details
        const id = req.body.user._id

        console.log(user.email)

        await UserContactList.updateOne({ _id: id },
            {
                $pull: { contacts: { _id: user._id } }
            },
            {
                new: true
            })

        await UserContactList.updateOne({ _id: user._id },
            {
                $pull: { contacts: { _id: id } }
            },
            {
                new: true
            })

        UserContactList.findOne({ _id: id }).then((data) => {
            console.log('UPDATED CONTACTS : ', data)
            res.status(201).json(data)
        })
    } catch (error) {
        console.log("ERROR IN REMOVE FRIEND : ", error)
        res.status(500).json({ message: error.message })
    }

}