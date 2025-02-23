import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { Level } from 'level';

const bot = new Telegraf(process.env.BOT_TOKEN);

const db = new Level('db', { valueEncoding: 'json' });

const userMemes = {
  5729713262: [
    {
      id: 'meme1',
      title: 'Doge Meme',
      gif_url:
        'https://media3.giphy.com/media/xT0xezQeqQQWRYgZ8k/giphy.gif',
      thumb_url:
        'https://media3.giphy.com/media/xT0xezQeqQQWRYgZ8k/giphy.gif',
    },
    {
      id: 'meme2',
      title: 'Success Kid',
      gif_url:
        'https://media4.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
      thumb_url:
        'https://media4.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
    },
  ],
  1141986832: [
    {
      id: 'meme3',
      title: 'Drake Hotline Bling',
      gif_url:
        'https://media2.giphy.com/media/xT1XGzAnABSxEg99Zu/giphy.gif',
      thumb_url:
        'https://media2.giphy.com/media/xT1XGzAnABSxEg99Zu/giphy.gif',
    },
  ],
};
const userBalances = {
  5729713262: 150,
  987654321: 75,
};

initializeUserMemes();

initializeUserBalances();

async function initializeUserMemes() {
  for (const userId in userMemes) {
    try {
      await db.put(userId, userMemes[userId]);
      console.log(`User ${userId}'s memes saved to database.`);
    } catch (err) {
      console.error(`Error saving user ${userId}'s memes:`, err);
    }
  }
};
async function initializeUserBalances() {
  for (const userId in userBalances) {
    try {
      await db.put(`${userId}_balance`, userBalances[userId]);
      console.log(`User ${userId}'s balance saved to database.`);
    } catch (err) {
      console.error(`Error saving user ${userId}'s balance:`, err);
    }
  }
};

bot.on('message', async (ctx) => {
  try {
    if (!ctx.message.web_app_data || !ctx.message.web_app_data.data)
      return;

    const data = JSON.parse(ctx.message.web_app_data.data);

    if (data.type !== 'balance_update')
      return;

    const userId = data.user_id;
    const newBalance = data.balance;

    await db.put(`${userId}_balance`, newBalance);

    console.log(`User ${userId}'s balance updated to ${newBalance}`);

    await ctx.reply(`Your balance has been updated to ${newBalance}`);
  } catch (error) {
    console.error('Error handling web app data:', error);
  };
});

// // console.log('Bot is running...');
// import { Telegraf } from 'telegraf';

// const bot = new Telegraf(process.env.BOT_TOKEN);

// const WEB_APP_URL = 'https://feathers.studio/telegraf/webapp/example';

bot.on('inline_query', async (ctx) => {
  const userId = ctx.from.id;

  try {
    const memes = await db.get(String(userId));

    if (!memes) {
      console.log(`No memes found for user ${userId}`);
      await ctx.answerInlineQuery([]);
      return;
    };

    const results = memes.map((meme) => ({
      type: 'gif',
      id: meme.id,
      gif_url: meme.gif_url,
      thumb_url: meme.thumb_url,
      title: meme.title,
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
  } catch (err) {
    console.error(`Error fetching memes for user ${userId}:`, err);
    await ctx.answerInlineQuery([]);
    return;
  }
});

await bot.launch();
