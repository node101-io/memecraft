// User -> Meme one to many

import mongoose from 'mongoose';
import validator from 'validator';
import { Meme } from '../meme/Meme';

const getUser = require('./functions/getUser');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const MAX_BALANCE_VALUE = 1e9;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const TIME_OUT_DURATION = 24 * 60 * 60 * 1000;

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
  is_time_out: {
    type: Date,
    default: 0
  },
  balance: {
    type: Number,
    default: 0,
    max: MAX_BALANCE_VALUE
  },
  minted_memes: {
    type: Array,
    default: [],
    maxlength:MAX_MEMES_ARRAY_LENGTH,
    validate: {
      validator: function (arr) {
        return arr.every((item) => typeof item === "object" && item !== null);
      }
    },
  }
});

UserSchema.statics.createUser = function (data, callback) {
  if(!data || typeof data !== 'object')
    return callback('bad_request');
  if(!data.telegram_id || typeof data.telegram_id != 'string')
    return callback('bad_request');
  if(!data.chopin_public_key || typeof data.chopin_public_key != 'string' || !validator.isUUID(data.chopin_public_key))
    return callback('bad_request');

  const newUserData = {
    telegram_id: data.telegram_id,
    chopin_public_key: data.chopin_public_key,
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
UserSchema.statics._createMemeForUser = function (userId, memeData, callback) {
  if (!userId || !validator.isMongoId(userId.toString()))
    return callback('bad_request');

  User.findById(userId).exec((err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('user_not_found');

 // TODO: move
    if (user.is_time_out && (Date.now() - new Date(user.is_time_out).getTime() < TIME_OUT_DURATION)) {
      return callback('user_timed_out');
    }

    if (!memeData || typeof memeData !== 'object')
      return callback('bad_request');
    if (!memeData.description || typeof memeData.description !== 'string')
      return callback('bad_request');
    if (!memeData.content_url || typeof memeData.content_url !== 'string')
      return callback('bad_request');
    if (!memeData.mint_price || typeof memeData.mint_price !== 'number')
      return callback('bad_request');

    const newMeme = new Meme({
      creator: userId,
      description: memeData.description,
      content_url: memeData.content_url,
      mint_price: memeData.mint_price
    });

    newMeme.save((err, meme) => {
      if (err) {
        if (err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        return callback('database_error');
      }

      User.findByIdAndUpdate(
        userId,
        { $push: { minted_memes: meme._id } },
        { new: true },
        (err, updatedUser) => {
          if (err) return callback('database_error');

          return callback(null, meme);
        }
      );
    });
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
};
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
};
UserSchema.statics.timeOutUserById = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findByIdAndUpdate(id, {$set: {
    is_time_out: Date.now()
  }}, { new: true }, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    getUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
  });
};
UserSchema.statics.updateBalanceById = function (id, newBalance, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');
  if (!newBalance || typeof newBalance != 'number' || newBalance > MAX_BALANCE_VALUE || newBalance < 0){
    return callback('bad_request');
  }
  User.findByIdAndUpdate(id, {$set: {
    balance: newBalance
  }}, { new: true }, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    getUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
  });

}
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
UserSchema.statics.purchaseMemesById = function (userId, memeId, callback) {
  if (!userId || !validator.isMongoId(userId.toString()))
    return callback('bad_request');
  if (!memeId || !validator.isMongoId(memeId.toString()))
    return callback('bad_request');

  User.findById(userId, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('user_not_found');

    Meme.findById(memeId, (err, meme) => {
      if (err) return callback('database_error');
      if (!meme) return callback('meme_not_found');

      if (user.balance < meme.mint_price)
        return callback('insufficient_balance');

      User.findById(meme.creator, (err, creatorUser) => {
        if (err) return callback('database_error');
        if (!creatorUser) return callback('creator_not_found');

        User.findByIdAndUpdate(
          userId,
          {
            $inc: { balance: -meme.mint_price },
            $push: { minted_memes: meme._id }
          },
          { new: true },
          (err, updatedUser) => {
            if (err) return callback('database_error');

            User.findByIdAndUpdate(
              meme.creator,
              { $inc: { balance: meme.mint_price } },
              { new: true },
              (err, updatedCreator) => {
                if (err) return callback('database_error');

                return callback(null, updatedCreator);
              }
            );
          }
        );
      });
    });
  });
};


export const User = mongoose.model('User', UserSchema);