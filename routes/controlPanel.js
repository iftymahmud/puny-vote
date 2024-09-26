// routes/controlPanel.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const VoteSession = require('../models/VoteSession');

// GET method to Delete Dashboard Vote List
router.get('/dashboard/delete/:voteSessionId', ensureAuthenticated, async (req, res) => {
    try {

    const voteSessionId = req.params.voteSessionId;

    await VoteSession.findOneAndDelete({
      _id: voteSessionId,
      organizer: req.session.userId
    });
  
    const voteSession = await VoteSession.find({ organizer: req.session.userId });
      
      res.render('dashboard', { voteSession });
    } catch (error) {
      console.error(error);
      res.render('dashboard', { voteSession: [] });
    }
  });



// GET method to Control Panel From Dashboard
router.get('/dashboard/controlPanel/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {

    const voteSessionId = req.params.voteSessionId;
    const voteSession = await VoteSession.findOne({
      _id: voteSessionId,
      organizer: req.session.userId,
    });

    
    res.render('controlPanel', { voteSession });
  } catch (error) {
    console.error(error);
    res.render('dashboard', { voteSession: [] });
  }
});





module.exports = router;
