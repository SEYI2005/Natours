const Review = require('../models/reviewModel');
const app = require('../app');
// const catchAsync = require('../utils/catchAsync');
const factoryFunction = require('../controllers/factoryFunction');

exports.confirmCredentials = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// Creaing the create review
exports.createReview = factoryFunction.createOne(Review);
exports.getReviews = factoryFunction.getAll(Review);
exports.getReview = factoryFunction.getOne(Review);
exports.deleteReview = factoryFunction.deleteOne(Review);
exports.updateReview = factoryFunction.updateOne(Review);
