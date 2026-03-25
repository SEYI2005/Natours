const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const BookingController = require('../controllers/bookingsController');
router.get(
  '/',
  BookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/tour/login', authController.isLoggedIn, viewController.login);
router.get('/logout', authController.logout);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUserData, when you are not using an API
// );
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

module.exports = router;
