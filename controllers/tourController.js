// tourController.js
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourmodel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryFunction = require('../controllers/factoryFunction');
// Using Memory Storage
const multerStorage = multer.memoryStorage();

//  Let us make our multer filter(the filter handles files that are not images)
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image please upload only images', 400), false);
  }
};
// // when there is one
//// upload.single('image');
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
// when there is more than one
// upload.array('images', 5);
// Alias top 5 tours

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }, // req.files
]);
exports.resizeImages = catchAsync(async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) {
    return next();
  }

  // 1) Cover Image
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  // 2) Other Images
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      }),
    );
  }

  next();
});
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// Standard CRUD using factory functions
exports.getAllTours = factoryFunction.getAll(Tour);
exports.getTour = factoryFunction.getOne(Tour, { path: 'reviews' });
exports.createTour = factoryFunction.createOne(Tour);
exports.updateTour = factoryFunction.updateOne(Tour);
exports.deleteTour = factoryFunction.deleteOne(Tour);

// Aggregation: Tour Stats
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { averagePrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

// Aggregation: Monthly Plan
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

// -------------------- GEO QUERIES -------------------- //

// Get tours within a certain distance from a point
// /tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  let [lat, lng] = latlng.split(',').map(Number);

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng',
        400,
      ),
    );

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, // lng, lat
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

// Get distances from a point
// /distances/:latlng/unit/:unit
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  let [lat, lng] = latlng.split(',').map(Number);

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng',
        400,
      ),
    );

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // mi or km

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] }, // lng, lat
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        spherical: true,
      },
    },
    {
      $project: { distance: 1, name: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { distances },
  });
});
