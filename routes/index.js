// routes/index.js
const express = require('express');
const router = express.Router();
const Session = require('../models/VoteSession');
const VoteSession = require('../models/VoteSession');
const Participant = require('../models/Participant');

// GET Home Page
router.get('/', (req, res) => {
  res.render('home', { error: null });
});


// POST Share Result Page
router.post('/share/:voteSessionCode', async (req, res) => {
  try {
    const voteSessionCode = req.params.voteSessionCode;
    const voteSession = await VoteSession.findOne({ code: voteSessionCode });

    let token = voteSession.token;

    if (!token) {
      token = Math.random().toString(36).substring(2, 8).toUpperCase();
      voteSession.token = token;
      await voteSession.save();
    }


    res.redirect(`/share/${voteSessionCode}/token=${token}`);
  } catch (error) {
    console.error(error);
    res.render('home', { error: 'An error occurred. Please try again.' });
  }
});


// GET Share Result Page
router.get('/share/:voteSessionCode/token=:token', async (req, res) => {
  try {
    const { voteSessionCode, token } = req.params;
    const voteSession = await VoteSession.findOne({ code: voteSessionCode });

    if (!voteSession || voteSession.token !== token) {
      return res.render('home', { error: 'Sorry, Link does not exist.' });
    }

    const participants = await Participant.find({ 
      'submissions.voteSession': voteSession._id 
    });

    const voteCounts = {};

    voteSession.questions.forEach((question) => {
      const questionNumber = question.questionNumber;
      voteCounts[questionNumber] = {};  
      
      question.options.forEach((option) => {
        voteCounts[questionNumber][option] = 0;  
      });
    });

    participants.forEach((participant) => {
      participant.submissions.forEach((submission) => {
        if (submission.voteSession.toString() === voteSession._id.toString()) {
          submission.votes.forEach((vote) => {
            const questionNumber = vote.questionNumber;
            const selectedOption = vote.selectedOption;
            
            if (voteCounts[questionNumber] && voteCounts[questionNumber][selectedOption] !== undefined) {
              voteCounts[questionNumber][selectedOption] += 1;
            }
          });
        }
      });
    });

    res.render('shareResults', { voteSession, voteCounts });
  } catch (error) {
    console.error(error);
    res.render('home', { error: 'An error occurred. Please try again.' });
  }
});









module.exports = router;
