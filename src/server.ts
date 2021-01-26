import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import cors from 'cors';
import mongoose from 'mongoose';

// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1

import AuthRoute from './routes/auth';
import User from './schema/users';

const __prod__ = process.env.NODE_ENV === 'production';
dotenv.config({
  path: __prod__ ? '.env' : '.env.development',
});

const PORT = process.env.PORT;
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY || 'fgryeujdnc bv';
const CORS_ORIGINS = process.env.CORS_ORIGINS;
const DB_URL = process.env.DB_URL || '';

const main = async () => {
  const app = express();

  app.use(express.json());
  app.use(morgan('dev'));

  // DB Connection

  // TODO: DB Connection must be here
  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on('open', () => {
    console.log('DB Connected');
  });

  mongoose.connection.on('error', (err) => {
    console.log(`DB Connection Error: ${err}`);
  });

  const user = new User({ email: 'asd', password: '123', fullName: 'Umit' });
  await user.save();

  app.use(
    session({
      name: 'qid',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, //1 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
      },
      secret: SESSION_SECRET_KEY,
      saveUninitialized: false,
      resave: false,
    })
  );

  app.use(
    cors({
      origin: CORS_ORIGINS,
      credentials: true,
    })
  );

  app.use('/api/auth', AuthRoute);

  app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
  });
};

// Start application
main().catch((err) => {
  console.log(`Server cant started!: ${err}`);
});
