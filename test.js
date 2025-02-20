import mongoose from 'mongoose';
import { User } from './backend/models/user/User.js';
import { Meme } from './backend/models/meme/Meme.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meme_generator');

const userTestData1 = {
  telegram_id: "memeCreator",
  chopin_public_key: "memeCreator",
}
// // let userID;
// let userID = "67b73dc4f084e7444886972b";
// let userID2= "67b742177a239bb7ce47183a";
// let memeID = "67b73c118603f958f018cd11";
// let memeID2 = "67b7426bfd56c7f6dd35f5e5"


// User.createUser(userTestData1, (err, user) => {
//   if(err)
//     return console.log(err);

//   // userID = user._id;
// });

const memeTestData = {
  description:"memePurchase",
  content_url:"memePurchase",
  mint_price:10
}
// User._createMemeForUser("67b77a4dbe9a4881c2b9bd71", memeTestData, (err, meme) => {
//   if(err) return console.log(err);

//   console.log(meme);
// });

// User.findUserByIdAndFormat(userID, (err, user) => {
//   if(err) return console.log(err);
//   console.log("hato format")
//   console.log(user);
// });

// User.timeOutUserById(userID, (err, user) => {
//   if(err) return console.log(err);

//   console.log(user)
// })

// User.updateBalanceById(userID, 10000, (err, user) => {
//   if(err) return console.log(err);

//   console.log(user)
// });

// User.findUserByPublicKey("f", (err, user) => {
//   if(err) return console.log(err);

//   console.log(user);
// })

// let userToPurchase = "67b77a289dc13871c7e3fc39";
// let memeId = "67b77a87d5b8306777e509e5"
// User.purchaseMemeById(userToPurchase, memeId, (err) => {
//   if(err) return console.log(err);
// })


// Meme.findMemeByFilters( { creator : "67b77a87d5b8306777e509e5" } ,  (err, meme) => {
//   if(err) return console.log(err);

//   console.log(meme);
// })