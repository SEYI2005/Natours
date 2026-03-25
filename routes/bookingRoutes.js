const bookingController = require('../controllers/bookingsController');
const authController = require('../controllers/authController');
const express = require('express');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

// protect all routes after this
router.use(authController.protect);
// restrict access to admin and lead-guide
router.use(authController.restrictTo('admin', 'lead-guide'));
router.post('/createBookings/:id', bookingController.createBookings);
router.get('/getAllBookings', bookingController.getAllBookings);
router.get('/getBooking/:id', bookingController.getBooking);
router.patch('/updateBookings/:id', bookingController.updateBookings);
router.delete('/deleteBooking/:id', bookingController.deleteBooking);

module.exports = router;
