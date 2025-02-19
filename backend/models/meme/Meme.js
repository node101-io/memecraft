import mongoose from 'mongoose';
import validator from 'validator';

const getMeme = require('./functions/getUser');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const MAX_MEME_MINT_PRICE = 1e6;
const MAX_TAGS_ARRAY_LENGTH = 1e4;

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;

const MemeSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Types.ObjectId, // user.telegram_id
    required: true,
    trim: true,
    unique: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  description: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  tag: {
    type: Array[String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= MAX_TAGS_ARRAY_LENGTH;
      },
    }
  },
  content_url: {
    type: String,
    required: true,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  mint_price: {
    type: Number,
    required: true,
    trim: true,
    max: MAX_MEME_MINT_PRICE
  }
});

MemeSchema.statics.createMeme = function (data, callback) {
  if(!data || typeof data !== 'object')
    return callback('bad_request');
  if(!data.creator || !validator.isMongoId(data.creator.toString()))
    return callback('bad_request');
  if(!data.description || typeof data.description != 'string')
    return callback('bad_request');
  if(!data.content_url || typeof data.content_url != 'string')
    return callback('bad_request');
  if(!data.mint_price || typeof data.mint_price != 'number')
    return callback('bad_request');

  const newMemeData = {
    creator: data.creator,
    description: data.description,
    content_url: data.content_url,
    mint_price: data.mint_price
  }
  const newMeme = new Meme(newMemeData);

  newMeme.save((err, meme) => {
    if (err) {
      if (err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');

      return callback('database_error');
    };

    return callback(null, meme);
  });
};

MemeSchema.statics.findMemeById = function (id, callback){
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Meme.findById(id, (err, meme) => {
    if (err) return callback('database_error');
    if (!meme) return callback('document_not_found');

    return callback(null, meme);
  });
};
// MemeSchema.statics.findMemeByIdAndUpdate = function (id, callback) {};
MemeSchema.statics.findMemeByIdAndDelete = function (id, callback) {
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Meme.findOneAndDelete({ _id: id }, (err, meme) => {
    if (err) return callback('database_error');
    if (!meme) return callback('document_not_found');

    return callback(null);
  });
};
MemeSchema.statics.findMemeByFilters = function (data) {
  const filters = [];

  if (data.creator) {
    filters.push({ creator: data.creator });
  }

  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    filters.push({ tags: { $in: data.tags } });
  }

  if (data.description && typeof data.description === 'string' && data.description.length > 0) {
    filters.push({ description: { $regex: data.description, $options: 'i' } });
  }

  const skip = data.skip || 0;
  const limit = data.limit || 10;

  return Meme.find(filters.length ? { $and: filters } : {})
    .sort()
    .skip(skip)
    .limit(limit)
    .exec();
};

export const Meme = mongoose.model('Meme', MemeSchema);
