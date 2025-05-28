const User = require('../models/User');
const generateToken = require('../utils/generateToken'); 
const { validationResult } = require('express-validator'); 


const registerUser = async (req, res, next) => {

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400); // Bad request
    return next(new Error('Please add all fields')); 
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
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Please provide email and password'));
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401); 
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
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
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};