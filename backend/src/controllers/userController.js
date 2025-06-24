const User = require('../models/User');
const asyncHandler = require('express-async-handler'); 
const generateToken = require('../utils/generateToken'); 

const registerUser = asyncHandler(async (req, res, next) => {
  console.log("REGISTER_USER_CONTROLLER: Request body:", req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return next(new Error('Please add all fields')); 
  }
  if (password.length < 6) {
    res.status(400);
    return next(new Error('Password must be at least 6 characters'));
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists'));
    }

    const user = await User.create({
      name,
      email,
      password, 
    });

    console.log("REGISTER_USER_CONTROLLER: User created in DB:", user);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  console.log("LOGIN_CONTROLLER: Login attempt with body:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Please provide email and password'));
  }

  try {
    const user = await User.findOne({ email }).select('+password'); 
    console.log("LOGIN_CONTROLLER: User found by email:", user ? user.email : "Not Found");

    if (user && (await user.matchPassword(password))) { 
      console.log("LOGIN_CONTROLLER: Password match successful.");
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      console.error("LOGIN_CONTROLLER: Invalid credentials for email:", email);
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    });
  } else {
    res.status(404);
    return next(new Error('User not found'));
  }
});

const getAllUsersForSharing = asyncHandler(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('_id name email');
    res.json(users);
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsersForSharing,
};