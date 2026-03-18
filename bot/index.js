require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-ngrok-url.ngrok.app'; // Replace with real or ngrok URL
const FIREBASE_KEY_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// 1. Initialize Firebase Admin
try {
  let serviceAccount;
  if (FIREBASE_KEY_PATH) {
    serviceAccount = require(path.resolve(__dirname, FIREBASE_KEY_PATH));
  } else {
    // If you pass the JSON straight as env variable (e.g., in Vercel)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  
  if (serviceAccount) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('Firebase Admin Initialized successfully.');
  }
} catch (error) {
  console.warn('⚠️ Could not initialize Firebase Admin. Custom auth will not work.', error.message);
}

// 2. Initialize Telegram Bot
let bot;
if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });
  
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Assalomu alaykum! WordBoost botiga xush kelibsiz. Ilovani ochish uchun tugmani bosing.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌟 WordBoost'ni ochish", web_app: { url: WEB_APP_URL } }]
        ]
      }
    });
  });

  console.log('Telegram Bot is running...');
} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN not found in .env');
}

// 3. Initialize Express API for seamless auth
const app = express();
app.use(cors());
app.use(express.json());

// Helper function to validate Telegram Web App initData
function validateTelegramWebAppData(telegramInitData) {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get('hash');
  let dataToCheck = [];
  
  initData.sort();
  initData.forEach((val, key) => {
    if (key !== 'hash') {
      dataToCheck.push(`${key}=${val}`);
    }
  });

  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const signature = crypto.createHmac('sha256', secret).update(dataToCheck.join('\n')).digest('hex');

  return signature === hash;
}

// Endpoint called by React frontend to get Firebase custom token
app.post('/api/auth/telegram', async (req, res) => {
  const { initData, user } = req.body; // user is tg.initDataUnsafe.user

  if (!initData || !user) {
    return res.status(400).json({ error: 'Missing initData or user' });
  }

  // Verify the data came from Telegram legitimately
  const isValid = validateTelegramWebAppData(initData);
  if (!isValid) {
    return res.status(403).json({ error: 'Invalid Telegram data' });
  }

  try {
    const uid = `tg_${user.id}`;
    
    // Create custom Firebase token
    // The frontend will use this to sign in: signInWithCustomToken(auth, token)
    if (!admin.apps.length) {
        throw new Error("Firebase Admin SDK is not initialized.");
    }

    const customToken = await admin.auth().createCustomToken(uid);
    res.json({ customToken });
    
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
