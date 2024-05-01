import mongoose from 'mongoose'

const UserContactListSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    contacts: [],
    incomingRequests: [],
    outgoingRequests: []
},{ timestamps: true });

const UserContactList = mongoose.model('user-contact-list', UserContactListSchema);

export default UserContactList;
