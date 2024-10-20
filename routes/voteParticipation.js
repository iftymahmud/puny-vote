// routes/voteParticipantion.js
const express = require('express');
const router = express.Router();
const VoteSession = require('../models/VoteSession');
const Participant = require('../models/Participant');


// GET Answer Page
router.get('/takevote/:voteSessionCode', async (req, res) => {
    try {
      const code = req.params.voteSessionCode;
      const voteSession = await VoteSession.findOne({ code: code });
      
      if (voteSession.voteFlag >= voteSession.questions.length ||
        voteSession.voteFlag == -1) {
        res.redirect(`/takevote/end/${voteSession.code}`);
      } else {
        res.render('answerPanel', {voteSession});
      }
    } catch (error) {
      console.error(error);
      res.render('home', { error: 'An error occurred. Please try again.' });
    }
});


// POST Answer Page
router.post('/takevote/:voteSessionCode', async (req, res) => {
    try {
      const code = req.params.voteSessionCode;
      const voteSession = await VoteSession.findOne({ code: code });
      
      if (voteSession.voteFlag >= voteSession.questions.length ||
        voteSession.voteFlag == -1) {
        res.redirect(`/takevote/end/${voteSession.code}`);
      } else {
        res.render('answerPanel', {voteSession});
      }
    } catch (error) {
      console.error(error);
      res.render('home', { error: 'An error occurred. Please try again.' });
    }
});








// GET Answer END Page
router.get('/takevote/end/:voteSessionCode', async (req, res) => {
    try {
      const code = req.params.voteSessionCode;
      const voteSession = await VoteSession.findOne({ code: code });

    res.render('answerPanelEnd', {voteSession});
    } catch (error) {
      console.error(error);
      res.render('home', { error: 'An error occurred. Please try again.' });
    }
  });






module.exports = router;
