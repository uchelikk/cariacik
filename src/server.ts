import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createConnection } from 'typeorm';
import session from 'express-session';
import cors from 'cors';

import AuthRoute from './routes/auth';

const __prod__ = process.env.NODE_ENV === 'production';
dotenv.config({
  path: __prod__ ? '.env' : '.env.development',
});

const PORT = process.env.PORT;
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY || 'fgryeujdnc bv';
const CORS_ORIGINS = process.env.CORS_ORIGINS;

const main = async () => {
  const app = express();

  app.use(express.json());
  app.use(morgan('dev'));

  // DB Connection
  try {
    await createConnection({
      type: 'postgres',
      url: process.env.DB_URL,
      entities: [__dirname + '/entity/User.ts'],
      logging: true,
      synchronize: true,
    });
  } catch (error) {
    console.log(`DB Connect Error: ${error}`);
  }

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
