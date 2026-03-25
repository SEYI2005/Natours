const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourmodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryFunction = require('../controllers/factoryFunction');
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1. Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //2. Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  //3. Create session as a response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary because it is unsecure (anyone can make booking without paying)
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

// The admin side
exports.createBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.create({
    tour: req.params.id,
    user: req.user.id,
    price: req.price,
  });
  res.status(201).json({
    status: 'Suscess',
    Message: 'Created',
    data: {
      bookings,
    },
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find();

  res.status(201).json({
    status: 'Suscess',
    Message: 'Created',
    data: {
      bookings,
    },
  });
  next();
});
exports.getBooking = factoryFunction.getOne(Booking);

exports.updateBookings = factoryFunction.updateOne(Booking);

exports.deleteBooking = factoryFunction.deleteOne(Booking);
