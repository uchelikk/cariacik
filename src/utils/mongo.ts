import mongoose from 'mongoose';
export default (DB_URL: string) => {
  // DB Connection
  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  mongoose.connection.on('open', () => {
    console.log('DB Connected');
  });

  mongoose.connection.on('error', (err) => {
    console.log(`DB Connection Error: ${err}`);
  });

  return mongoose;
};
