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

      let submitFlag = 0; 
      const participant = await Participant.findById(req.session.userId);
      let lastQuestionNumber = participant.submissions?.at(-1)?.votes?.at(-1)?.questionNumber;
    
      if(lastQuestionNumber >= voteSession.voteFlag+1){
        submitFlag = 1;
      }
      
      if (voteSession.voteFlag >= voteSession.questions.length ||
        voteSession.voteFlag == -1) {
        res.redirect(`/takevote/end/${voteSession.code}`);
      } else {
        res.render('answerPanel', {voteSession, submitFlag});
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
      const selectedOption = req.body.selectedOption;


      const voteSession = await VoteSession.findOne({ code: code });
      const participant = await Participant.findById(req.session.userId);
      const currentQuestion = voteSession.questions[voteSession.voteFlag];

      if (!participant.submissions) {
        participant.submissions = [];
      }
  
      let submission = participant.submissions.find(sub => sub.voteSession.equals(voteSession._id));
  
      if (!submission) {
        submission = {
          voteSession: voteSession._id,
          votes: []
        };
        participant.submissions.push(submission);
        await participant.save();
        submission = participant.submissions.find(sub => sub.voteSession.equals(voteSession._id));
      }
  
      const newVote = {
        questionNumber: currentQuestion.questionNumber,
        selectedOption
      };
  
      submission.votes.push(newVote); 
      await participant.save();
      
    res.redirect(`/takevote/${voteSession.code}`);
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
