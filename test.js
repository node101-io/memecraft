import { User } from './app/models/user/User.js';
import { Meme } from './app/models/meme/Meme.js';

import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meme_generator');

const rootData = {
  telegram_id: "rootUser",
  chopin_public_key: "rootUser",
}

const buyerData = {
  telegram_id: "buyer",
  chopin_public_key: "buyer"
}
const creatorData = {
  telegram_id: "creator",
  chopin_public_key: "creator"
}

const rootId = "67b9e25a9a5f147df8abe265";
const buyerId = "67b9e261493a82cf5208b047";
const creatorId = "67b9e266416f2e83ed52b908";
const memeId = "67b9e294251a8e6cfa181368";

// _id: "67b9d98e20db978d99289d86"
const memeCreatorData = {
  userId: creatorId,
  dateNow: "1740232787",
  memeData: {
    description: "bla bla bla",
    content_url: "bla bla bla",
    mint_price: 1
  }
}

// User.createUser(creatorData, (err, user) => {
//   if(err)
//     return console.log(err);

//   console.log(user);
//   User.createMemeForUser(memeCreatorData, (err, meme) => {
//     if (err) return console.log(err);

//     console.log(meme)
//   })
// })


User.purchaseMemeById(buyerId, memeId, (err) => {
  if(err) return console.log(err);
})