# MemeCraft

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
