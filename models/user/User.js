import mongoose from 'mongoose';
import validator from 'validator';

const getUser = require('./functions/getUser');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;


const UserSchema = new mongoose.Schema({
  telegram_id:{
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  chopin_public_key: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  telegram_username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
  },
  is_banned: {
    type: Boolean,
    default: false
  }
});

UserSchema.statics.createUser = function (data, callback) {
  if(!data || typeof data !== 'object')
    return callback('bad_request');
  if(!data.telegram_id || typeof data.telegram_id != 'string')
    return callback('bad_request');
  if(!data.chopin_public_key || typeof data.chopin_public_key != 'string' || !validator.isUUID(data.chopin_public_key))
    return callback('bad_request');
  if(!data.telegram_username || typeof data.telegram_username != 'string')
    return callback('bad_request');
}
UserSchema.statics.findUserById = function (data, callback) {

}
UserSchema.statics.findUserByIdAndFormat = function (data, callback) {

}
UserSchema.statics.findUserByIdAndUpdate = function (data, callback) {

}
UserSchema.statics.findUserByIdAndDelete = function (data, callback) {

}
UserSchema.statics.findUserByFilters = function (data, callback) {

}

export const Wallet = mongoose.model('Wallet', UserSchema);