// User -> Meme one to many

import mongoose from 'mongoose';
import validator from 'validator';
import { Meme } from '../meme/Meme.js';

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const MAX_BALANCE_VALUE = 1e9;
const TIME_OUT_DURATION = 24 * 60 * 60 * 1000;
const MAX_MEMES_ARRAY_LENGTH = 1e6;

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;

const DEFAULT_RECENTLY_ADDED_MEMES_COUNT = 6;
const COMISSION_RATE = 0.05;
const ROOT_PUBLIC_KEY = "0xed3b7C457c767f26F2Bab253031CFeCaf50D0f03";

const UserSchema = new mongoose.Schema({
  telegram_id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  chopin_public_key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  timeout: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 10,
    max: MAX_BALANCE_VALUE
  },
  minted_memes: {
    type: [
      {
        meme_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        last_used_at: {
          type: Number,
          default: 0
        }
      }
    ],
    default: [],
    _id: false
  }
});

UserSchema.statics.createUser = function (data, callback) {
  if (!data || typeof data !== 'object')
    return callback('bad_request');

  if (!data.chopin_public_key || typeof data.chopin_public_key != 'string')
    return callback('bad_request');

  User.findUserByPublicKey(data.chopin_public_key, false, (err, user) => {
    if (err && err !== 'user_not_found')
      return callback(err);

    if (user)
      return callback(null, user);

    if (!data.telegram_id || typeof data.telegram_id != 'string')
      return callback('bad_request');

    User.create({
      telegram_id: data.telegram_id,
      chopin_public_key: data.chopin_public_key,
    })
      .then(user => {
        return callback(null, user);
      })
      .catch(err => {
        console.error(err);
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');

        if (err)
          return callback('database_error');
      });
  });
};

UserSchema.statics.findUser = function (data, callback) {
  if (!data || typeof data !== 'object')
    return callback('bad_request');

  const filters = {};

  if (data.telegram_id && typeof data.telegram_id === 'string') {
    filters.telegram_id = data.telegram_id;
  }

  if (data.chopin_public_key && typeof data.chopin_public_key === 'string') {
    filters.chopin_public_key = data.chopin_public_key;
  }

  if (data._id && validator.isMongoId(data._id.toString())) {
    filters._id = data._id;
  }

  if (Object.keys(filters).length === 0)
    return callback('bad_request');

  User.findOne(filters)
    .then(user => {
      if (!user) return callback('user_not_found');
      return callback(null, user);
    })
    .catch(err => {
      console.error(err);
      return callback('database_error');
    });
};

UserSchema.statics.createMemeForUser = function (data, callback) {
  if (!data.chopin_public_key || typeof data.chopin_public_key !== 'string')
    return callback('bad_request');

  User.findUserByPublicKey(data.chopin_public_key, false, (err, user) => {
    if (err)
      return callback('database_error');

    if (!user)
      return callback('user_not_found');

    if (user.timeout && data.dateNow - user.timeout < TIME_OUT_DURATION)
      return callback('user_timed_out');

    if (!data.memeData || typeof data.memeData !== 'object')
      return callback('bad_request');

    if (!data.memeData.content_url || typeof data.memeData.content_url !== 'string')
      return callback('bad_request');

    if (!data.memeData.description || typeof data.memeData.description !== 'string')
      return callback('bad_request');

    if (!data.memeData.mint_price || typeof data.memeData.mint_price !== 'number')
      return callback('bad_request');

    if (!data.memeData.tags || !Array.isArray(data.memeData.tags) || data.memeData.tags.length === 0)
      return callback('bad_request');

    Meme.create({
      creator: user._id,
      content_url: data.memeData.content_url,
      description: data.memeData.description,
      mint_price: data.memeData.mint_price,
      tags: data.memeData.tags
    })
      .then(newMeme => {
        if (!newMeme) return callback('database_error');

        User.findByIdAndUpdate(user._id, { $push: {
          minted_memes: {
            meme_id: newMeme._id
          }
        }}, { new: true })
          .then(() => {
            return callback(null, newMeme)
          })
          .catch(err => {
            console.log(err);
            return callback('database_error');
          });
      })
      .catch(err => {
        console.log(err);
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');

        if (err)
          return callback('database_error');
      });
    });
};

UserSchema.statics.findUserById = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findById(id)
    .then(user => {
      if (!user)
        return callback('document_not_found');

      return callback(null, user);
    })
    .catch(_ => callback('database_error'));
};

UserSchema.statics.timeOutUserById = function (id, dateNow, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findByIdAndUpdate(id, {$set: {
    timeout: dateNow
  }}, { new: true })
    .then(user => {
      if (!user) return callback('user_not_found');

      return callback(null, user);
    })
    .catch(err => {
      if (err) return callback('database_error');
    });
};

UserSchema.statics.checkIfUserIsTimedOut = function (data, callback) {
  if (!data || typeof data !== 'object')
    return callback('bad_request');

  if (!data.chopin_public_key || typeof data.chopin_public_key !== 'string')
    return callback('bad_request');

  if (!data.dateNow || typeof data.dateNow !== 'number')
    return callback('bad_request');

  User.findUserByPublicKey(data.chopin_public_key, false, (err, user) => {
    if (err)
      return callback(err);

    if (!user)
      return callback('user_not_found');

    const isUserTimedOut = data.dateNow - user.timeout < TIME_OUT_DURATION;

    return callback(null, isUserTimedOut);
  });
};

UserSchema.statics.updateBalanceById = function (id, incrementBalanceBy, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');
  if (!incrementBalanceBy || typeof incrementBalanceBy != 'number' || incrementBalanceBy > MAX_BALANCE_VALUE || incrementBalanceBy < 0){
    return callback('bad_request');
  }
  User.findByIdAndUpdate(id, {$inc: {
    balance: incrementBalanceBy
  }}, { new: true })
    .then(user => {
      if (!user) return callback('document_not_found');

      return callback(null, user);
    })
    .catch(err => {
      if (err) return callback('database_error');
    });
};

UserSchema.statics.findUserByPublicKey = function (publicKey, with_minted_memes = false, callback) {
  if (!publicKey || typeof publicKey !== 'string')
    return callback('bad_request');

  let query = User.findOne({ chopin_public_key: publicKey });

  if (with_minted_memes)
    query.populate({
      path: 'minted_memes.meme_id',
      model: 'Meme',
      populate: {
        path: 'creator',
        model: 'User',
        select: '-minted_memes'
      }
    }).lean();

  query
    .then(user => {
      if (!user) return callback('user_not_found');

      if (with_minted_memes && user.minted_memes)
        user.minted_memes = user.minted_memes.map(memeObj => ({
          meme: memeObj.meme_id,
          last_used_at: memeObj.last_used_at
        }));

      return callback(null, user);
    })
    .catch(err => callback(err));
};

UserSchema.statics.purchaseMemeById = function (data, callback) {
  if (!data.buyerId || !validator.isMongoId(data.buyerId.toString()))
    return callback('bad_request');
  if (!data.memeId || !validator.isMongoId(data.memeId.toString()))
    return callback('bad_request');

  User.findUserById(data.buyerId, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('user_not_found');

    Meme.findMemeById(data.memeId, (err, meme) => {
      if (err) return callback('database_error');
      if (!meme) return callback('meme_not_found');

      if(meme.creator == data.buyerId)
        return callback ('invalid_purchase');

      if (user.balance < meme.mint_price)
        return callback('insufficient_balance');

      User.findUserById(meme.creator, (err, creatorUser) => {
        if (err) return callback('database_error');
        if (!creatorUser) return callback('creator_not_found');

        User.findByIdAndUpdate(
          data.buyerId,
          {
            $inc: { balance: -meme.mint_price },
            $push: { minted_memes:{
                meme_id: meme._id,
                last_used_at: data.dateNow
            }}
          },
        )
        .then(updatedUser => {
          if (!updatedUser) return callback('database_error');

          const COMISSION = meme.mint_price * COMISSION_RATE;

          User.findByIdAndUpdate(
            meme.creator,
            { $inc: { balance: meme.mint_price - COMISSION } }
          )
          .then(() => {
            User.findUserByPublicKey(ROOT_PUBLIC_KEY, false, (err, memeGenerator) => {
              if (err)
                return callback(err);
              if (!memeGenerator)
                return callback('ERROR!');

              User.findByIdAndUpdate(memeGenerator._id, { $inc: { balance: COMISSION } })
                .then(() => {
                  return callback(null);
                })
                .catch(err => {
                  return callback('database_error');
                });
            })
            return callback(null);
          })
          .catch(err => {
            return callback('database_error');
          });
        })
      });
    });
  });
};

UserSchema.statics.findLastUsedMemesByUserId = function (userId, callback) {
  if(!userId || !validator.isMongoId(userId.toString()))
    return callback('bad_request');
  User.findUserById(userId, (err, user) => {
    if (err) return callback(err);


  })
};

UserSchema.statics.findRecentlyAddedMemesByPublicKey = function (publicKey, callback) {
  if (!publicKey || typeof publicKey !== 'string')
    return callback('bad_request');

  User.findUserByPublicKey(publicKey, true, (err, user) => {
    if (err)
      return callback(err);

    if (!user)
      return callback('user_not_found');

    if (!user.minted_memes || user.minted_memes.length === 0)
      return callback(null, []);

    const recentlyAddedMemes = user.minted_memes.slice(-DEFAULT_RECENTLY_ADDED_MEMES_COUNT).map(memeObj => memeObj);

    return callback(null, recentlyAddedMemes);
  });
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
