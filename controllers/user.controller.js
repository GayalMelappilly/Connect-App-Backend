import User from "../models/user.model.js"


export const userList = async (req,res) => {
    try {
        const username = req.query.search 
        console.log("USERNAME IN DB : ",username)
        const userList = await User.find({
            $or: [
                { email: { $regex: new RegExp(username, 'i') } },
                { displayName: { $regex: new RegExp(username, 'i') } }
            ]
        });
        res.status(200).json(userList)
    } catch (error) {
        console.log("ERROR IN USER CONTROLLER ",error)
        res.status(500).json({message : 'ERROR IN USER CONTROLLER.'})
    }
}