// get the built-in model for the mongoose
const mongoose = require('mongoose');
// Get the built in model for the dotenv to load your .env file
const dotenv = require('dotenv'); // The dotenv module is used to load the .env files in your application
// execute the file
dotenv.config({ path: './config.env' });
process.on('uncaughtException', (err) => {
  // used in handling  asynchronus code
  console.log('UNCAAUGHT EXCEPTION! ⛔ Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); // we use the code 1 because we handling uncaught expressions
});
// require yor app.js in your server.js
const app = require('./app');
// make the db to be a variable in your sever.js
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
// allow mongoose to connect to your database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // ✅ required for new driver
    useCreateIndex: true,
  })
  .then(() => console.log('DB connection successful!'));

// ✅ Only run DB logic AFTER connection is read

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
process.on(
  'unhandledRejection', // used in handling Asynchronus errors
  (err) => {
    console.log('UNHANDLED REJECTION! ⛔ Shutting down...');
    console.log(err);
    server.close(() => {
      process.exit(1); // we use the code 1 because we handling uncaught expressions
    });
  },
);
