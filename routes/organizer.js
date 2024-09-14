// routes/organizer.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const VoteSession = require('../models/VoteSession');

// GET Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const voteSession = await VoteSession.find({ organizer: req.session.userId });
    res.render('dashboard', { voteSession });
  } catch (error) {
    console.error(error);
    res.render('dashboard', { voteSession: [] });
  }
});



// GET Create Voting Session
router.get('/create-vote-session', ensureAuthenticated, (req, res) => {
    res.render('createVoteSession', { error: null });
  });
  
// POST Create Voting Session
router.post('/create-vote-session', ensureAuthenticated, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.render('createVoteSession', { error: 'Title is required.' });
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const voteSession = new VoteSession({
    organizer: req.session.userId,
    title : title,
    code : code,
  });

  try {
    await voteSession.save();
    res.redirect('/organizer/dashboard');
  } catch (error) {
    console.error(error);
    res.render('createVoteSession', { error: 'An error occurred. Please try again.' });
  }
});
  

module.exports = router;
