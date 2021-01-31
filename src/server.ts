import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import cors from 'cors';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongo';

// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1
// https://mongoosejs.com/docs/validation.html#the-unique-option-is-not-a-validator

import AuthRoute from './routes/auth';
import RoomRoute from './routes/rooms';
import OutgoingsRoute from './routes/outgoings';
import IncomesRoutes from './routes/incomes';
import TestRoutes from './routes/test';

import { Auth } from './middlewares/Auth';
import { Error } from './middlewares/Error';
import { body, sanitize } from 'express-validator';

const __prod__ = process.env.NODE_ENV === 'production';
dotenv.config({
  path: __prod__ ? '.env' : '.env.development',
});

const { PORT, SESSION_SECRET_KEY, CORS_ORIGINS, DB_URL } = process.env;

const main = async () => {
  const app = express();

  app.use(express.json());
  app.use(morgan('dev'));

  const MongoStore = connectMongo(session);

  // DB Connection
  mongoose.connect(DB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  mongoose.connection.on('open', () => {
    console.log('DB Connected');
  });

  mongoose.connection.on('error', (err) => {
    console.log(`DB Connection Error: ${err}`);
  });

  app.use(
    session({
      name: 'qid',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, //1 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__,
      },
      secret: SESSION_SECRET_KEY!,
      saveUninitialized: true,
      resave: true,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  );

  app.use(
    cors({
      origin: CORS_ORIGINS,
      credentials: true,
    })
  );

  // escape all and trim!
  app.use(body('*').escape().trim());

  app.use('/api/auth', AuthRoute);
  app.use('/api/rooms', Auth, RoomRoute);
  app.use('/api/outgoings', Auth, OutgoingsRoute);
  app.use('/api/incomes', Auth, IncomesRoutes);
  app.use('/api', Auth, TestRoutes);

  app.use(Error);
  app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
  });
};

// Start application
main().catch((err) => {
  console.log(`Server cant started!: ${err}`);
});
