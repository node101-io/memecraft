# MemeCraft

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [How It Works?](#how-it-works)
  - [Create Your Meme with AI](#create-your-meme-with-ai)
  - [Mint Your Meme as an NFT](#mint-your-meme-as-an-nft)
  - [Collect Memes](#collect-memes)
  - [Have Fun & Be Part of the Internet Culture](#have-fun--be-part-of-the-internet-culture)
- [Features](#features)
- [Our Experience with Chopin Framework](#our-experience-with-chopin-framework)
- [Challenges & Solutions](#challenges--solutions)
  - [AI-Powered Meme Generation Without Compromising User Experience](#ai-powered-meme-generation-without-compromising-user-experience)
  - [Solution: A Privacy-First, Mini App Experience](#solution-a-privacy-first-mini-app-experience)
  - [Telegram Mini App Limitations](#telegram-mini-app-limitations)
  - [Challenge: Optimizing User Experience in Telegram Mini App Display Modes](#challenge-optimizing-user-experience-in-telegram-mini-app-display-modes)
  - [Challenge: Web App Button Visibility on Telegram iOS](#challenge-web-app-button-visibility-on-telegram-ios)
- [Running Locally](#running-locally)
- [Contact With Us](#contact-with-us)

## Overview
MemeCraft is a Telegram mini app that enables users to create and customize meme templates with just a few taps. Make memes, mint memes all in one chat! With AI-powered meme generation, users can effortlessly craft unique and hilarious content. Collect exclusive internet culture moments!

MemeCraft leverages the Chopin Framework to enhance security and decentralization while maintaining a seamless user experience. As a sovereign rollup on Celestia, it ensures scalability and trustless execution without modifying the core development process. Users can enjoy creating and minting memes without dealing with the complexities of blockchain technology—just pure fun and creativity!

Beyond just fun creation users can mint their memes as NFTs and others can collect them. MemeCraft allows creators to earn recognition for their viral content, while collectors can own exclusive meme NFTs. Whether you’re a meme master or a seasoned collector, MemeCraft makes it easy to unleash your creativity and reap the rewards of going viral.

## System Architecture
- **Telegram Mini App**: MemeCraft operates within Telegram, allowing seamless user interaction in any chat.
- **AI-Powered Meme Generation**: AI suggests meme captions or formats based on user input.
- **NFT Minting & Collecting**: Users can mint memes as NFTs and collect them. Meme hard, mint harder!
- **Chopin Framework**: Provides the infrastructure for MemeCraft to be a sovereign rollup on Celestia, ensuring security and decentralization.
- **Storage & Scalability**: MemeCraft optimizes meme storage using Pinata’s IPFS infrastructure.

## How It Works?
MemeCraft makes meme creation, minting, and collecting effortless—all within Telegram. Whether you’re a casual memer or an NFT collector, here’s how you can get started:

### Create Your Meme with AI
1. Type `@craftmemebot` in your Telegram chat.
2. Open the MemeCraft mini app and go to the MemeCraft page.
3. Describe your meme—let AI suggest something funny or choose from popular templates.

### Mint Your Meme as an NFT
- Once your meme is ready, mint it with just one tap and turn memes into collectibles!

### Collect Memes
- Browse the **Marketplace page** to explore memes crafted by others.
- Mint viral memes and use them in your chats by selecting them from your library.

### Have Fun & Be Part of the Internet Culture
- Use memes because words are overrated, make them go viral, and leave your mark on meme history.
- Collect rare memes and own a piece of the Internet culture.
- **Create. Mint. Collect. Repeat.** 😎

## Features
✔ **AI-Powered Meme Generation** – Create memes instantly with AI suggestions.

✔ **Seamless Telegram Mini App** – No need for external apps or websites.

✔ **One-Tap NFT Minting** – Easily mint memes on **a secure, decentralized rollup**.

✔ **Meme Collecting** – Own viral memes as NFTs and use them in your chat.

✔ **Zero Crypto Hassle** – No need to manage wallets—MemeCraft takes care of it.

## Our Experience with Chopin Framework
During the development of MemeCraft, we integrated the Chopin Framework for ensuring verification.

One of the initial issues we faced was that the Oracle function did not accept arguments. This was a critical limitation for our use case since we implement all the POST requests with Oracle. We needed a more dynamic approach. We reached out to **LZRS**, and a fix was implemented to improve Oracle flexibility.

For authentication, we first used the **cookie method** that Chopin Framework offers, but since the mini app is running inside an **iframe**, cookie usage was limited. So, we migrated to **JWT authentication**, which Chopin also offers.

## Challenges & Solutions

### AI-Powered Meme Generation Without Compromising User Experience
One of the core features envisioned for MemeCraft was an **AI-driven meme generator** that could analyze the last 100 messages in a chat and dynamically create a meme based on the conversation.

However, we found that accessing chat history required a bot to be present in the conversation. This raised privacy concerns—MemeCraft was designed to be effortless and fun, and requiring users to add a bot to their private chats could feel intrusive.

As a decentralized sovereign rollup, we chose not to compromise on user privacy or impose unnecessary friction. Instead, we explored alternative approaches that would allow MemeCraft to generate memes seamlessly without requiring intrusive permissions or centralized data access.

### Solution: A Privacy-First, Mini App Experience
✅ **No Bots, No Intrusion** – We prioritized user privacy and opted to build MemeCraft as a **Telegram Mini App** instead of a bot, ensuring users can create memes without needing to add a bot to their personal chats.

✅ **Seamless & Fun** – Users can still quickly describe their meme or let AI suggest one, keeping the experience smooth and intuitive, without the friction of bot permissions.

✅ **Gossip-Friendly Design** – Whether you're spilling tea with your best friend or having a private conversation, MemeCraft stays out of your chat—so you can meme freely without an AI bot lurking in the background.

This decision keeps MemeCraft **fun, lightweight, and privacy-friendly**, ensuring effortless meme creation without disrupting personal conversations.

### Telegram Mini App Limitations

#### Challenge: Optimizing User Experience in Telegram Mini App Display Modes
Telegram Mini Apps offer two display modes:
1. **Mini App Window** – A full-screen experience inside Telegram.
2. **Inline Helper** – A compact interface displayed directly above the keyboard, allowing seamless interaction while messaging.

Our initial approach was to make MemeCraft available in the **Inline Helper**, providing users with a fast and easy way to create memes within conversations. However, MemeCraft’s reliance on **the Chopin framework for blockchain interactions** introduced constraints, making it difficult to deliver a full-featured experience in the Inline Helper.

#### Solution: Seamless Transition Between Mini App and Inline Helper
- **Core Features in the Mini App** – Users can now access AI-powered meme generation, NFT minting, and meme discovery within the full Telegram Mini App for a smoother and more powerful experience.
- **Inline Helper for Quick Access** – To keep convenience in messaging, we still allow users to access their meme inventory through the Inline Helper, making it easy to share and use memes instantly.

This approach balances usability with functionality, ensuring effortless meme creation and minting without disrupting the user experience.

### Challenge: Web App Button Visibility on Telegram iOS
During development, we encountered an unexpected platform-specific limitation—on **iOS Telegram clients**, the **web_app button** in **inline query results** does not appear when using `InlineQueryResultGif` or `InlineQueryResultPhoto`.

This was a significant usability issue because the button works flawlessly on **Telegram Web** and **Android**, but on iOS, users couldn't easily access the MemeCraft web app directly from inline query results.

#### Solution: Reporting & Seeking a Fix
✅ Opened an Official Issue – We documented and reported the issue to Telegram’s development team to seek a resolution. (You can track the issue [here](https://github.com/TelegramMessenger/Telegram-iOS/issues/1687))

By staying proactive, we aim to ensure seamless meme creation across all Telegram platforms, delivering the same frictionless experience to iOS, Android, and Web users alike. 🚀

### Running Locally

1. Clone the repository
```bash
git clone https://github.com/node101-io/memecraft.git
```

2. Install dependencies
```bash
pnpm install
```

3. Create bot environment variables in `bot/.env`
```bash
BOT_TOKEN='<bot_token>'
MONGODB_URI='<mongodb_uri>'
```

4. Create app environment variables in `app/.env`
```bash
PINATA_JWT='<pinata_jwt>'
MONGODB_URI='<mongodb_uri>'
IMGFLIP_USERNAME='<imgflip_username>'
IMGFLIP_PASSWORD='<imgflip_password>'
```

5. Run the app and the bot in development mode
```bash
pnpm run dev
```

## Contact With Us
Telegram:
[@necipsagiro](https://t.me/necipsagiro) | [@hatunozcn](https://t.me/hatunozcn) | [@yakupaltay](https://t.me/yakupaltay)

🧘‍♀️ **Ready to Meme? Start Now!**

Type `@craftmemebot` in Telegram and start creating!