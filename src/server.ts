import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import cors from 'cors';
import mongo from './utils/mongo';
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
import { body, query, param } from 'express-validator';

// dotenv.config({
//   path: __prod__ ? '.env' : '.env.development',
// });
dotenv.config();

const { PORT, SESSION_SECRET_KEY, DB_URL } = process.env;

const main = async () => {
  const app = express();

  app.use(express.json());
  app.use(morgan('dev'));

  const MongoStore = connectMongo(session);

  const db = mongo(DB_URL!);

  app.use(
    session({
      name: 'qid',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, //1 years
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      },
      secret: SESSION_SECRET_KEY!,
      saveUninitialized: true,
      resave: true,
      store: new MongoStore({ mongooseConnection: db.connection }),
    })
  );

  app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );

  // escape all and trim!
  app.use(body('*').escape().trim());
  app.use(query('*').escape().trim());
  app.use(param('*').escape().trim());

  app.use('/api/auth', AuthRoute);
  app.use('/api/rooms', Auth, RoomRoute);
  app.use('/api/outgoings', Auth, OutgoingsRoute);
  app.use('/api/incomes', Auth, IncomesRoutes);
  app.use('/api', TestRoutes);
  app.use(Error);

  app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
  });
};

// Start application
main().catch((err) => {
  console.log(`Server cant started!: ${err}`);
});
