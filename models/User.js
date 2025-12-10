const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,          // normalize email
    trim: true
  },
  name: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: function() {
      return this.isRegisteredUser;
    }
  },
  roles: {
    type: [String],
    enum: ['User', 'Admin'],
    default: ['User']
  },
  refreshToken: {
    type: String,
    default: ''
  },
  pictureURL: {
    type: String,
    default: ''
  },
  isGoogleVerified: {
    type: Boolean,
    default: false
  },
  isRegisteredUser:{
    type:Boolean,
    default:false
  }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema,"Users");