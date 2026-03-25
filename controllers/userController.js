const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const User = require('../models/usermodel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factoryFunction = require('../controllers/factoryFunction');
const { xContentTypeOptions } = require('helmet');
// Let us make our multer storage
// Using disk storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}--${Date.now()}.${ext}`);
//   },
// });

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

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = factoryFunction.getAll(User);
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}--${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create error if user Posts Password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }
  //2. Update user document
  // We filtered out unwanted  names that are not allowed to be updated
  if (!req.user || !req.user.id) {
    return next(new AppError('No authenticated user found', 401));
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  if (!req.user || !req.user.role) {
    filteredBody.role = 'user';
  }
  if (req.file) filteredBody.photo = req.file.filename;

  // const user = await User.findById(req.user.id); it contais a reqired fielsd so we would use FidByIdAndUpdate instead
  const Updateduser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: Updateduser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  if (!user) {
    return next(new AppError('No user with that Id found', 404));
  }
  res.status(204).json({
    status: 'Success',
    Message: 'User Deleted',
  });
});
exports.getMe = catchAsync(async (req, res, next) => {
  const me = await User.findById(req.user.id);
  res.status(200).json({
    status: 'Success',
    data: {
      user: me,
    },
  });
});

exports.getUser = exports.getTour = factoryFunction.getOne(User);
exports.updateUser = factoryFunction.updateOne(User);
exports.deleteUser = factoryFunction.deleteOne(User);
exports.createUser = (req, resfield) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use/signup',
  });
};
