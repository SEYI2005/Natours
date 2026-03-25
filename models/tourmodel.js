const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// This is the Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // Using the validate module
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      reqiured: [true, 'tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficlty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // This only points to the current doc on NEW document creation
          return val < this.price; // 100 < 200
        },
        message: `Discount price ({VALUE}) should be below regular price`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // Longitude and Latitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], // Longitude and Latitude
        address: String,
        description: String,
        day: 'Number',
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },

  {
    // Making the virtual property to be displayed when it is ran
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 }); // Sorting the price index in an ascending order
tourSchema.index({ price: 1, ratingsAverage: -1 }); // Sorting the price index in an ascending order and ratingsAverage in a descending order
tourSchema.index({ slug: 1 }); // Sorting the slug index in an ascending order
tourSchema.index({ startLocation: '2dsphere' });

// Defining a virtual property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// This is  Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// Document middleware(using pre)
tourSchema.pre('save', function (next) {
  console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Using Embeding
//tourSchema.pre('save', async function (next) {
// const guidesPromises =  this.guides.map(async(id) => await user.findById(id)); // This returns an array of promises
//this.guides = await Promise.all(guidesPromises);

//next();
// });

// we can have multiple pre and post middlewares for the same hook
// tourSchema.pre('save', function (next) {
// console.log('will save document');
//   next();
// });
// tourSchema.pre('save', function (doc, next) {
//console.log(doc);
//   next();
// });
// Document middleware(using post)
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next(); // This will work only for find method
// });
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
}); // This will work for all the query that starts with find

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// using post
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  console.log(docs);
  next();
});
// Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
// Creating the  aggregatrion for the tour stats (static function)

// This is the model

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
