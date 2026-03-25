const path = require('path');
const express = require('express');
const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
app.use(express.json({ limit: '10kb' })); // in order to perform post methods(passes he data from the body)
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  }),
);
app.use(cookieParser()); // passes te data from cookie
app.set('view engine', 'pug');
// to find the location of the views
app.set('views', path.join(__dirname, 'views'));
// using pug as a template engine

// 1. Global Middlewares

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Data saitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// security middleware(sets various http headers for security purposes)
//For handling static files(files that don't have any routes)

// Developement logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//Limit Reqests from same IP
// const limiter = rateLimit({
//   max: 3, // max number of requests from same IP
//   windowMs: 60 * 60 * 1000, // in one hour
//   message: 'Too many requests from this IP, please try again in an hour!',
// });
// app.use('/api', limiter);

// Using the hpp parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
app.use(compression());

// Testing  middleware-
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mount routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all(/(.*)/, (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // next();

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// let us  create the error handling middleware
app.use(globalErrorHandler);

// this middleware handles the routes that are not defined in our app(tours and users)

module.exports = app;
