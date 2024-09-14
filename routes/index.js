// routes/index.js
const express = require('express');
const router = express.Router();
const Session = require('../models/VoteSession');

// GET Home Page
router.get('/', (req, res) => {
  res.render('home', { error: null });
});


module.exports = router;
