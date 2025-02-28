# MemeCraft

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
  - [Telegram Mini App](#1️⃣-telegram-mini-app)
  - [User Authentication & Wallet Management](#2️⃣-user-authentication--wallet-management)
  - [AI-Powered Meme Generation](#3️⃣-ai-powered-meme-generation)
  - [NFT Minting & Blockchain Execution](#4️⃣-nft-minting--blockchain-execution)
  - [Meme Marketplace & Monetization](#5️⃣-meme-marketplace--monetization)
  - [Scalability & Decentralization](#6️⃣-scalability--decentralization)
- [How It Works?](#how-it-works)
  - [Create Your Meme with AI](#create-your-meme-with-ai)
  - [Mint Your Meme as an NFT](#mint-your-meme-as-an-nft)
  - [Collect Memes](#collect-memes)
  - [Have Fun & Be Part of the Internet Culture](#have-fun--be-part-of-the-internet-culture)
- [Business Model](#business-model)
  - [Current Model](#current-model)
    - [Minting & Revenue Split](#minting--revenue-split)
  - [Future Plannings](#future-plannings)
    - [Premium Subscription](#premium-subscription)
    - [TIA Token Bridging for Meme Minting](#tia-token-bridging-for-meme-minting)
    - [Social Sharing & Integration](#social-sharing--integration)
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
![image](https://github.com/user-attachments/assets/09047e43-4869-43d2-aba0-c4f5056209a5)
### 1️⃣ **Telegram Mini App**

MemeCraft operates as a **Telegram WebApp**, allowing users to generate, mint, and trade memes via inline queries. The frontend (**Next.js**) communicates with the Backend API (**Chopin Framework**) for authentication, meme management, and blockchain interactions.

### 2️⃣ **User Authentication & Wallet Management**
- Users authenticate via JWT tokens, with **MPC wallets** generated for secure blockchain interactions.
- The **Chopin Framework** intercepts and sequences transactions, syncing timestamps with **Chopin Oracle**.

### 3️⃣ **AI-Powered Meme Generation**
- Users input prompts, and AI generates meme text.
- Meme data is uploaded to Pinata (IPFS) for decentralized storage.

### 4️⃣ **NFT Minting & Blockchain Execution**
- Users set a mint price and submit a `POST /api/meme/create` request.
- The Chopin Framework:
  - **Verifies signatures**, retrieves the **user’s MPC wallet**, and sequences the transaction.
  - Mints memes as NFTs, updating user balances.
  - Batches transactions for efficiency before committing them to Celestia Blockchain.

### 5️⃣ **Meme Marketplace & Monetization**
- Users buy/sell memes via `POST /api/meme/mint.`
- The Chopin Framework:
  - Verifies buyer signatures and deducts balances.
  - Makes the NFT / Meme transaction and updates creator earnings.
  - **Processes platform fees** before confirming the transaction.

### 6️⃣ **Scalability & Decentralization**
- **[Chopin Framework](https://chopin.sh/docs/quickstart)** ensures rollup execution with minimal gas costs.
- **[Pinata (IPFS)](https://www.pinata.cloud/)** provides scalable, decentralized storage.
- **[Celestia Blockchain](https://celestia.org/)** secures NFT ownership while enabling fast settlement.

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

## Business Model
MemeCraft is a free-to-use meme creation platform where users can generate, mint, and share memes without any upfront cost. When a new user joins, a wallet with **10 $MEME tokens** is automatically created and funded, allowing them to start using the platform immediately.

To sustain the ecosystem, we’ve implemented a simple financial model that rewards creators while keeping operations running.

### Current Model
- Users receive **10 $MEME** upon signup.
- They can generate **5 memes for free per day**.
- After that, each meme costs **1 $MEME** to cover AI processing costs.

#### Minting & Revenue Split
When a meme is minted and reused, both the creator and the platform benefit:
- **Creator Payout**: 0.95 $MEME (95%)
- **Platform Commissio**n: 0.05 $MEME (5%)

### Future Plannings

#### Premium Subscription
- Users can **subscribe** to remove the **5 meme/day limit** for unlimited meme generation.
- Subscription can be paid using **$MEME** tokens or **$TIA** tokens (once [bridging](https://chopin.sh/docs/guides/token#bridging) is available).

#### TIA Token Bridging for Meme Minting
- Once [Chopin’s bridge](https://chopin.sh/docs/guides/token#bridging) is live, users will be able to bridge TIA tokens to mint memes on MemeCraft.
- This will allow Stargaze and Cosmos ecosystem users to participate easily, driving the meme culture OGs of Cosmos to MemeCraft.

#### Social Sharing & Integration
- One click meme sharing to **Twitter, Discord, and Whatsapp** in addition to the current implementation on Telegram.
- Possible Stargaze and Cosmos integrations for **cross-platform exposure**.

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