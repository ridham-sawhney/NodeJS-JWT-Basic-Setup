const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    roles:{
        type: [String],
        enum: ['User', 'Admin'],
        default: ['User']
    },
    refreshToken:{
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema,"Users");