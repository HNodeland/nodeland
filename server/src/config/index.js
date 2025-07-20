import dotenv from 'dotenv';

dotenv.config();

export default {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_URL || 'https://haakon.nodeland.no',
  sessionSecret: process.env.SESSION_SECRET,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  rawUrl: process.env.RAW_URL || 'https://nodeland.no/clientraw.txt',
};