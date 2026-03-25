const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
// You do not need to be authenticated to use this routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// You need to be authenticated to use this routes
router.use(authController.protect); // This will protect all the routes that come after this middleware
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.patch('/updatePassword', authController.updatePassword);
router.delete('/deleteMe', userController.deleteMe);
router.get('/getMe', userController.getMe);

// This will allow the routes after it to only be accessed by the admins
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// Exporting the  file
module.exports = router;
