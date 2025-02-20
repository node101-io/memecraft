import mongoose from 'mongoose';
import { User } from './backend/models/user/User.js';
import { Meme } from './backend/models/meme/Meme.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meme_generator');

const userTestData1 = {
  telegram_id: "10101fw1",
  chopin_public_key: "1010f010",
}

User.createUser(userTestData1, (err, user) => {
  if(err)
    return console.log(err);

  return console.log(user);
});
