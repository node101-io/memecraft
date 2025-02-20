import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/celestia');

const app = express();
const server = http.createServer(app);

const PORT = config.port || 3000;

app.use(express.json());
app.use(express.static('public', { extensions: ['html'] }));
