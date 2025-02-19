import mongoose from 'mongoose';
import validator from 'validator';

const getMeme = require('./functions/getUser');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;

const MemeSchema = new mongoose.Schema({
  owner: {
    type: String, // user.telegram_id
    required: true,
    trim: true,
    unique: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  description: {
    type: String,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  tag: {
    type: [String],
  },
  metadata: {
    type: Object,
    default: {},
  }
});

MemeSchema.statics.createMeme = function (data, callback) {
  if(!data || typeof data !== 'object')
    return callback('bad_request');
  if(!data.owner || typeof data.owner != 'string')
    return callback('bad_request');
  if(!data.metadata || typeof data.metadata != 'object')
    return callback('bad_request');

  const newMemeData = {
    owner: data.owner,
    metadata: data.metadata
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
MemeSchema.statics.findMemeByFilters = function (data, callback) {
  const filters = [];

  if (data.owner) // (user.telegram_id)
    filters.push({ owner: data.owner });

  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    filters.push({
      tag: { $in: data.tags },
    });
  }
  if (data.metadata && typeof data.metadata === 'object') {
    Object.keys(data.metadata).forEach((key) => {
      filters.push({ [`metadata.${key}`]: data.metadata[key] });
    });
  }

  const skip = data.skip || 0;
  const limit = data.limit || 10;

  Meme.find(filters.length ? { $and: filters } : {})
  .sort()
  .skip(skip)
  .limit(limit)
  .then((memes) => callback(null, memes))
  .catch((err) => callback('database_error'));
};

export const Meme = mongoose.model('Meme', MemeSchema);
