// routes/controlPanel.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const VoteSession = require('../models/VoteSession');
const Participant = require('../models/Participant');

// GET method to Delete Dashboard Vote List
router.get('/dashboard/delete/:voteSessionId', ensureAuthenticated, async (req, res) => {
    try {

    const voteSessionId = req.params.voteSessionId;

    const deletedVoteSession = await VoteSession.findOneAndDelete({
      _id: voteSessionId,
      organizer: req.session.userId
    });

    await Participant.deleteMany({
      code: deletedVoteSession.code
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
    const participant = await Participant.find({ code: voteSession.code });

    voteSession.voteFlag = -1;
    await voteSession.save();

    res.render('controlPanel', { voteSession, participant });
  } catch (error) {
    console.error(error);
    res.render('dashboard', { voteSession: [] });
  }
});




// POST method on Control Panel
router.post('/dashboard/controlPanel/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    const voteSessionId = req.params.voteSessionId;

    res.redirect(`/dashboard/controlPanel/${voteSessionId}`);
  } catch (error) {
    console.error(error);
    res.render('controlPanel', { voteSession: [] });
  }
});

// GET method on Question Panel
router.get('/dashboard/questionPanel/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    const voteSessionId = req.params.voteSessionId;
    const voteSession = await VoteSession.findOne({
      _id: voteSessionId,
      organizer: req.session.userId,
    });

    const participants = await Participant.find({ 
      'submissions.voteSession': voteSessionId 
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
        if (submission.voteSession.toString() === voteSessionId) {
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




    res.render('questionPanel', { voteSession, voteCounts });
  } catch (error) {
    console.error(error);
    res.render('controlPanel', { voteSession: [] });
  }
});


// POST method on Question Panel
router.post('/dashboard/questionPanel/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    const voteSessionId = req.params.voteSessionId;
    const voteSession = await VoteSession.findOne({
      _id: voteSessionId,
      organizer: req.session.userId,
    });

    voteSession.voteFlag += 1;
    await voteSession.save();

    if (voteSession.voteFlag >= voteSession.questions.length) {
      res.redirect(`/organizer/dashboard/questionPanelEnd/${voteSessionId}`);
    } else {
      res.redirect(`/organizer/dashboard/questionPanel/${voteSessionId}`);
    }
  } catch (error) {
    console.error(error);
    res.render('controlPanel', { voteSession: [] });
  }
});




// GET method Question panel End
router.get('/dashboard/questionPanelEnd/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    const voteSessionId = req.params.voteSessionId;
    const voteSession = await VoteSession.findOne({
      _id: voteSessionId,
      organizer: req.session.userId,
    });

    voteSession.voteFlag = -1;
    await voteSession.save();

    res.render('questionPanelEnd', { voteSession });
  } catch (error) {
    console.error(error);
    res.render('controlPanel', { voteSession: [] });
  }
});


// GET method on Question Preview
router.get('/dashboard/questionPreview/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    const voteSessionId = req.params.voteSessionId;
    const voteSession = await VoteSession.findOne({
      _id: voteSessionId,
      organizer: req.session.userId,
    });

    res.render('questionPreview', { voteSession });
  } catch (error) {
    console.error(error);
    res.render('dashboard', { voteSession: [] });
  }
});




module.exports = router;
