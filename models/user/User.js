import mongoose from 'mongoose';
import validator from 'validator';

const getUser = require('./functions/getUser');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;


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

  const newUserData = {
    telegram_id: data.telegram_id,
    chopin_public_key: data.chopin_public_key,
    telegram_username: data.telegram_username,
  }
  const newUser = new User(newUserData);

  newUser.save((err, user) => {
    if (err) {
      if (err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');

      return callback('database_error');
    };

    return callback(null, user);
  });
};
UserSchema.statics.findUserById = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findById(id, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    return callback(null, user);
  });
}
UserSchema.statics.findUserByIdAndFormat = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    getUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
  });
}
UserSchema.statics.findUserByIdAndBan = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findByIdAndUpdate(id, {$set: {
    is_banned: true
  }}, { new: true }, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    getUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
  });
};
UserSchema.statics.findUserByIdAndDelete = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findOneAndDelete({ _id: id }, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    return callback(null);
  })
};
UserSchema.statics.findUserByPublicKey = function (publicKey, callback) {
  if (!publicKey || typeof publicKey !== 'string' || !validator.isUUID(publicKey))
    return callback('bad_request');

  User.findOne({ chopin_public_key: publicKey }, (err, user) => {
    if (err) return callback(err);
    if (!user) return callback('user_not_found');
    return callback(null, user);
  });
};

export const User = mongoose.model('User', UserSchema);