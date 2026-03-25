const mongoose = require('mongoose');
const Tour = require('./tourmodel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please Review the tour'],
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    createdAt: {
      type: Date,
      default: Date.now, // ✅ no parentheses
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // ✅ Schema options go here (second argument)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// // Using query middleware
reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await Review.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: Math.floor(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});
//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.post(/^findOneAnd/, async function () {
  this.r = await this.findOne();
  console.log(this.r);
});
reviewSchema.post(/^findOneAnd/, async function () {
  // await  this.findOne(); does not work here, query is already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
// Model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
// POST/tour/234adf/reviews // nested route
// GET/tour/234adf/reviews // nested route
// GET/tour/t5gg8i/reviews/sdfb nested route
