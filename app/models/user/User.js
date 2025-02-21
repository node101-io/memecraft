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

const COMISSION_RATE = 0.05;

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
          required: true
        }
      }
    ],
    default: []
  }
});

UserSchema.statics.createUser = function (data, callback) {
  if(!data || typeof data !== 'object')
    return callback('bad_request');
  if(!data.telegram_id || typeof data.telegram_id != 'string')
    return callback('bad_request');
  if(!data.chopin_public_key || typeof data.chopin_public_key != 'string') // || !validator.isUUID(data.chopin_public_key))
    return callback('bad_request');
  if(!data.timeout || typeof data.typeof != 'number')
    return callback('bad_request');

  User.findUser(data, (err, user) => {
    if (user)
      return callback(null, user);
  });

  User.create({
    telegram_id: data.telegram_id,
    chopin_public_key: data.chopin_public_key,
    timeout: data.timeout
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
  });
};

User.schema.statics.findUser = function (data, callback) {
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

  if (Object.keys(filters).length === 0) {
    return callback('bad_request');
  }

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
  if (!data.userId || !validator.isMongoId(data.userId.toString()))
    return callback('bad_request');
  User.findById(data.userId)
    .catch( err  => {
      if (err) return callback('database_error');
    })
    .then(user => {
      if (!user) return callback('user_not_found');

      if (user.timeout && (new Date(data.dateNow).getTime() - user.timeout) < TIME_OUT_DURATION) {
        return callback('user_timed_out');
      }

      if (!data.memeData || typeof data.memeData !== 'object')
        return callback('bad_request');
      if (!data.memeData.description || typeof data.memeData.description !== 'string')
        return callback('bad_request');
      if (!data.memeData.content_url || typeof data.memeData.content_url !== 'string')
        return callback('bad_request');
      if (!data.memeData.mint_price || typeof data.memeData.mint_price !== 'number')
        return callback('bad_request');

      Meme.create({
        creator: data.userId,
        description: data.memeData.description,
        content_url: data.memeData.content_url,
        mint_price: data.memeData.mint_price
      })
      .then(newMeme => {
        if (!newMeme) return; // Ensures execution stops if Meme creation failed

        return User.findByIdAndUpdate(
          data.userId,
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

UserSchema.statics.timeOutUserById = function (id, dateNow, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findByIdAndUpdate(id, {$set: {
    timeout: dateNow
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

// The following function is a basis for lots of POST requests.
UserSchema.statics.updateUserById = function (id, data, callback) {
  const User = this;

  if (!data || typeof data !== 'object')
    return callback('bad_request');

  const updateData = {};

  if (data.change_in_balance && typeof data.change_in_balance === 'number' && data.change_in_balance <= MAX_BALANCE_VALUE)
    updateData.$inc = { balance: data.change_in_balance };

  if (data.timeout && !isNaN(Date.parse(data.timeout)))
    updateData.$set = { timeout: data.timeout };

  if (data.minted_memes && Array.isArray(data.minted_memes) && data.minted_memes.length <= MAX_MEMES_ARRAY_LENGTH) {
    const validMemes = data.minted_memes.filter(meme => validator.isMongoId(meme.id));

    if (validMemes.length !== data.minted_memes.length)
      return callback('bad_request');

    updateData.$push = {
      minted_memes: {
        $each: validMemes.map(meme => ({
          id: meme.id,
          last_used_date: meme.last_used_date
        }))
      }
    };
  };

  if (Object.keys(updateData).length === 0)
    return callback('bad_request');

  User.findUserById(id, (err, user) => {
    if (err)
      return callback(err);

    if (!user)
      return callback('document_not_found');

    User.findByIdAndUpdate(user._id, updateData, { new: true })
      .then(updatedUser => {
        if (!updatedUser)
          return callback('database_error');

        return callback(null, updatedUser);
      })
      .catch(_ => callback('database_error'));
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
          const commission = meme.mint_price * COMISSION_RATE;
          User.findByIdAndUpdate(
            meme.creator,
            { $inc: { balance: meme.mint_price - commission } }
          )
          .then(() => {
            User.findUserByPublicKey(MEME_GENERATOR_PUBLIC_KEY, (err, memeGenerator) => {
              if(err)
                return callback(err);
              if(!memeGenerator)
                return callback('ERROR!');
              User.findByIdAndUpdate(
                memeGenerator._id,
                { $inc: { balance: commission } },
              )
              .then(()=> {
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

export const User = mongoose.model('User', UserSchema);