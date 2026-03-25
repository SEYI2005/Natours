const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('../../models/tourmodel');
const User = require('../../models/usermodel');
const Review = require('../../models/reviewModel');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true, // Don't include the useCreateIndex option it will not connect to the DB
    useUnifiedTopology: true, // ✅ required for new driver
    useCreateIndex: true,
  })
  .then(() => console.log('DB connection successful!'));
// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// Import data into database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log('Data Successfully Loaded');
  } catch (err) {
    console.log(err);
    process.exit();
  }
};
// De;ete all data from the database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Sucessfully Deleted');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
