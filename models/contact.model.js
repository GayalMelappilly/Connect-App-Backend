const mongoose = require('mongoose');

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
});

const UserContactListModel = mongoose.model('user-contact-list', UserContactListSchema);

module.exports = UserContactListModel;
