// routes/questinos.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const VoteSession = require('../models/VoteSession');

// GET Create Questions
router.get('/create-questions', ensureAuthenticated, (req,res) => {
    res.render('createQuestions', {});
  });
  
  // GET Create Questions
  //TBW

module.exports = router;
