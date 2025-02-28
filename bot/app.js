import 'dotenv/config';
import mongoose from 'mongoose';
import validator from 'validator';
import { Telegraf } from 'telegraf';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memecraft');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('inline_query', async (ctx) => {
  const userId = ctx.from.id;
  const searchTerm = ctx.inlineQuery.query;

  const response = await fetch(`https://memecraft.node101.io/api/user/show?telegram_id=${userId}`);

  const data = await response.json();

  if (!data.success) {
    console.log(`No user found for user ${userId}`);
    await ctx.answerInlineQuery([], {
      button: {
        text: 'Welcome! Tap here to get started!',
        web_app: {
          url: `https://memecraft.node101.io?user_id=${userId}`
        }
      },
      cache_time: 0
    });
    return;
  };

  if (!data.data.minted_memes || !data.data.minted_memes.length) {
    console.log(`No memes found for user ${userId}`);
    await ctx.answerInlineQuery([], {
      button: {
        text: 'Get memes or create your own!',
        web_app: {
          url: `https://memecraft.node101.io?user_id=${userId}`
        }
      },
      cache_time: 0
    });
    return;
  };

  const results = data.data.minted_memes
    .slice(data.data.minted_memes.length - 24)
    .reverse()
    .sort((a, b) => b.last_used_at - a.last_used_at)
    .filter(meme => {
      if (validator.isMongoId(searchTerm))
        return meme.meme._id === searchTerm;

      if (searchTerm)
        return meme.meme.description.toLowerCase().includes(searchTerm.toLowerCase());

      return true;
    })
    .map(meme => ({
      type: 'photo', 
      id: meme.meme._id,
      photo_url: meme.meme.content_url,
      thumb_url: meme.meme.content_url,
      caption: meme.meme.creator.name ? `Created by ${meme.meme.creator.name}.meme` : undefined,
      show_caption_above_media: true,
    }));

  await ctx.answerInlineQuery(results, {
    button: {
      text: 'Get more',
      web_app: {
        url: `https://memecraft.node101.io?user_id=${userId}`
      }
    },
    cache_time: 0
  });
});

bot.on('chosen_inline_result', async (ctx) => {
  const response = await fetch(`https://memecraft.node101.io/api/meme/used?telegram_id=${ctx.from.id}&meme_id=${ctx.chosenInlineResult.result_id}`);

  const data = await response.json();

  if (!data.success)
    console.log(`Error marking meme as used: ${data.error}`);
});

bot.command('start', async (ctx) => {
  const userId = ctx.from.id;
  
  await ctx.reply('Welcome to MemeCraft!', {
    reply_markup: {
      inline_keyboard: [[
        {
          text: 'Open MemeCraft',
          web_app: {
            url: `https://memecraft.node101.io?user_id=${userId}`
          }
        }
      ]]
    }
  });
});

await bot.launch();
