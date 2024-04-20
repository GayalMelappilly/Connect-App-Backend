import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
            console.log("Connected to Database")
    } catch (error) {
        console.log('Connection to database failed. Err : ',error)
    }
}

export default connectDB