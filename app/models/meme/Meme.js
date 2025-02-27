// User -> Meme one to many

import mongoose from 'mongoose';
import validator from 'validator';

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const MAX_MEME_MINT_PRICE = 1e6;
const MAX_TAGS_ARRAY_LENGTH = 1e4;

const MemeSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  description: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  tags: {
    type: Array,
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

MemeSchema.statics.findMemeById = function (id, callback){
  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Meme.findById(id)
    .then(meme => {
      if (!meme) return callback('document_not_found');

      return callback(null, meme);
    })
    .catch(err => {
      if (err) return callback('database_error');
    });
};
MemeSchema.statics.findMemesByFilters = function (data, callback) {
  const filters = [];

  if (data.creator)
    filters.push({ creator: data.creator });

  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0)
    filters.push({ tags: { $in: data.tags } });

  if (data.description && typeof data.description === 'string' && data.description.length > 0)
    filters.push({ description: { $regex: data.description, $options: 'i' } });

  const skip = data.skip || 0;
  const limit = data.limit || 10;

  Meme
    .find(filters.length ? { $and: filters } : {})
    .populate('creator', 'name chopin_public_key')
    .sort({ _id: -1 }) // Sort by newest first (descending order)
    .skip(skip)
    .limit(limit)
    .then(memes => {
      if(!memes)
        return callback('document_not_found');

      const transformedMemes = memes.map(meme => {
        const memeObj = meme.toObject ? meme.toObject() : meme;
        
        if (memeObj.creator)
          memeObj.creatorName = memeObj.creator.name || memeObj.creator.chopin_public_key;
        
        return memeObj;
      });

      return callback(null, transformedMemes);
    })
    .catch(err => {
      console.error(err);
      return callback('database_error');
    });
};

export const Meme = mongoose.models.Meme || mongoose.model('Meme', MemeSchema);
