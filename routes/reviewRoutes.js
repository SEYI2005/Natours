const reviewController = require('../controllers/reviewControllers');
const authController = require('../controllers/authController');
const express = require('express');
const router = express.Router({ mergeParams: true }); // To have parameters of other routes

// Review routes
// All the routes need to be protected
router.use(authController.protect);
router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.confirmCredentials,
    reviewController.createReview,
  )
  .get(reviewController.getReviews);
// Guides should not be able to edit or delete reviews(They are the one performing the job)

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    reviewController.updateReview,
    authController.restrictTo('user, admin'),
  )
  .delete(
    reviewController.deleteReview,
    authController.restrictTo('user, admin'),
  );
module.exports = router;
