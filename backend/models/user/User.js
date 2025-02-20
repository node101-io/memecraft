// User -> Meme one to many

import mongoose from 'mongoose';
import validator from 'validator';
import { Meme } from '../meme/Meme.js';

import { getUser } from './functions/getUser.js';

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const MAX_BALANCE_VALUE = 1e9;
const TIME_OUT_DURATION = 24 * 60 * 60 * 1000;
const MAX_MEMES_ARRAY_LENGTH = 1e6;

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
    unique: true,
    trim: true,
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
  console.log("1");
  if(!data.telegram_id || typeof data.telegram_id != 'string')
    return callback('bad_request');
  console.log("2");
  if(!data.chopin_public_key || typeof data.chopin_public_key != 'string') // || !validator.isUUID(data.chopin_public_key))
    return callback('bad_request');
  console.log("3");

  User.create({
    telegram_id: data.telegram_id,
    chopin_public_key: data.chopin_public_key,
  })
  .then(user => {
    return callback(null, user);
  })
  .catch(err => {
    console.log(err);
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err)
      return callback('database_error');
  })
};

UserSchema.statics._createMemeForUser = function (userId, memeData, callback) {
  if (!userId || !validator.isMongoId(userId.toString()))
    return callback('bad_request');
  console.log("hato create meme 1")
  User.findById(userId)
    .catch( err  => {
      if (err) return callback('database_error');
    })
    .then(user => {
      if (!user) return callback('user_not_found');

      if (user.is_time_out && (Date.now() - new Date(user.is_time_out).getTime() < TIME_OUT_DURATION)) {
        return callback('user_timed_out');
      }
      console.log("hato create meme 2")
      if (!memeData || typeof memeData !== 'object')
        return callback('bad_request');
      if (!memeData.description || typeof memeData.description !== 'string')
        return callback('bad_request');
      if (!memeData.content_url || typeof memeData.content_url !== 'string')
        return callback('bad_request');
      if (!memeData.mint_price || typeof memeData.mint_price !== 'number')
        return callback('bad_request');
      console.log("hato create meme 3")

      Meme.create({
        creator: userId,
        description: memeData.description,
        content_url: memeData.content_url,
        mint_price: memeData.mint_price
      })
      .then(newMeme => {
        if (!newMeme) return; // Ensures execution stops if Meme creation failed

        return User.findByIdAndUpdate(
          userId,
          { $push: { minted_memes: newMeme._id } },
          { new: true }
        ).then(() => callback(null, newMeme));
      })
      .catch(err => {
        console.log(err);
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err)
          return callback('database_error');
      });
      // .catch(err => {
      //   if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      //     return callback('duplicated_unique_field');
      //   if (err)
      //     return callback('database_error');
      // })
      // .then(newMeme => {
      //   User.findByIdAndUpdate(
      //     userId,
      //     { $push: { minted_memes: newMeme._id } },
      //     { new: true }
      //     .catch(err => {
      //       if (err) return callback('database_error');
      //     })
      //     .then(updatedUser => {
      //       return callback(null, newMeme);
      //     })
      //   );
      // });
    });
};
UserSchema.statics.findUserById = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findById(id)
  .catch(err => {
    if (err) return callback('database_error');
  })
  .then(user => {
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
  }}, { new: true })
  .catch(err => {
    if (err) return callback('database_error');
  })
  .then(user => {
    if (!user) return callback('document_not_found');

    getUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
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
  .catch(err => {
    if (err) return callback('database_error');
  })
  .then(user => {
    if (!user) return callback('document_not_found');

    getUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user.balance);
    });
  });
};
// UserSchema.statics.findUserByIdAndDelete = function (id, callback) {
//   if (!id || !validator.isMongoId(id.toString()))
//     return callback('bad_request');

//   User.findOneAndDelete({ _id: id })
//   .catch(err => {
//     if (err) return callback('database_error');
//   })
//   .then(user => {
//     if (!user) return callback('document_not_found');

//     return callback(null);
//   });
// };
UserSchema.statics.findUserByPublicKey = function (publicKey, callback) {
  if (!publicKey || typeof publicKey !== 'string') // || !validator.isUUID(publicKey))
    return callback('bad_request');

  User.findOne({ chopin_public_key: publicKey })
  .catch(err => {
    if (err) return callback(err);
  })
  .then(user => {
    if (!user) return callback('user_not_found');

    return callback(null, user);
  });
};
UserSchema.statics.purchaseMemeById = function (userId, memeId, callback) {
  if (!userId || !validator.isMongoId(userId.toString()))
    return callback('bad_request');
  if (!memeId || !validator.isMongoId(memeId.toString()))
    return callback('bad_request');

  User.findUserById(userId, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('user_not_found');

    Meme.findMemeById(memeId, (err, meme) => {
      if (err) return callback('database_error');
      if (!meme) return callback('meme_not_found');

      if(meme.creator == userId)
        return callback ('invalid_purchase');

      if (user.balance < meme.mint_price)
        return callback('insufficient_balance');

      User.findUserById(meme.creator, (err, creatorUser) => {
        console.log(err);

        if (err) return callback('database_error');
        if (!creatorUser) return callback('creator_not_found');

        User.findByIdAndUpdate(
          userId,
          {
            $inc: { balance: -meme.mint_price },
            $push: { minted_memes: meme._id }
          },
        )
        .then(updatedUser => {
          if (!updatedUser) return callback('database_error');
          User.findByIdAndUpdate(
            meme.creator,
            { $inc: { balance: meme.mint_price } },
          );
        })
        .then(() => {
          return callback(null);
        })
        .catch(err => {
          console.log(err);
          return callback('database_error');
        });
      });
    });
  });
};

export const User = mongoose.model('User', UserSchema);