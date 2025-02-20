import mongoose from 'mongoose';
import { User } from './backend/models/user/User.js';
import { Meme } from './backend/models/meme/Meme.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meme_generator');

const userTestData1 = {
  telegram_id: "f",
  chopin_public_key: "f",
}
// let userID;
let userID = "67b725bfbaf9f443d9c1706e";

User.createUser(userTestData1, (err, user) => {
  if(err)
    return console.log(err);

  userID = user._id;
});

// const memeTestData = {
//   description:"svfv",
//   content_url:"sfccv",
//   mint_price:1
// }
// // User._createMemeForUser(userID, memeTestData, (err, meme) => {
// //   if(err) return console.log(err);

// //   console.log(meme);
// // });

// User.findUserById(userID, (err, user) => {
//   if(err) return console.log(err);
//   console.log("hato user")
//   console.log(user);
// });

// User.timeOutUserById(userID, (err, user) => {
//   if(err) return console.log(err);

//   console.log(user)
// })