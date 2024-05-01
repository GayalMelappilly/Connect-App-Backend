import mongoose from 'mongoose'

const UserContactListSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    contacts: [],
    incomingRequests: [{
        _id: mongoose.Schema.Types.ObjectId
    }],
    outgoingRequests: [{
        _id: mongoose.Schema.Types.ObjectId
    }]
},{ timestamps: true });

const UserContactList = mongoose.model('user-contact-list', UserContactListSchema);

export default UserContactList;
