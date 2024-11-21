// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET Sign Up Page
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// POST Sign Up
router.post('/signup', async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName || !email || !password || !confirmPassword) {
    return res.render('signup', { error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match.' });
  }

    // **Password Validation Start**
  // - At least 8 characters
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const isPasswordValid = passwordRegex.test(password);
  // console.log(`Password Validation: ${isPasswordValid ? 'Passed' : 'Failed'}`);

  if (!isPasswordValid) {
    return res.render('signup', { 
      error: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.' 
    });
  }
  // **Password Validation End**

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'Email is already registered.' });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    req.session.userId = user._id;
    res.redirect('/organizer/dashboard');
  } catch (error) {
    console.error(error);
    res.render('signup', { error: 'An error occurred. Please try again.' });
  }
});

// GET Sign In Page
router.get('/signin', (req, res) => {
  res.render('signin', { error: null });
});

// POST Sign In
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('signin', { error: 'All fields are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('signin', { error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('signin', { error: 'Invalid email or password.' });
    }

    req.session.userId = user._id;
    res.redirect('/organizer/dashboard');
  } catch (error) {
    console.error(error);
    res.render('signin', { error: 'An error occurred. Please try again.' });
  }
});

// GET Sign Out
router.get('/signout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
