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

    // Join the Socket.IO room
    const voteSessionCode = voteSession.code;
    req.io.on('connection', (socket) => {
      socket.join(`session_${voteSessionCode}`);
    });

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



    const revealFlag = voteSession.revealFlag || false;

    res.render('questionPanel', { voteSession, voteCounts, revealFlag });
  } catch (error) {
    console.error(error);
    res.render('controlPanel', { voteSession: [] });
  }
});


// POST method on Question Panel
router.post('/dashboard/questionPanel/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    const voteSessionId = req.params.voteSessionId;
    const action = req.body.action;

    const voteSession = await VoteSession.findOne({
      _id: voteSessionId,
      organizer: req.session.userId,
    });

    if (!voteSession) {
      throw new Error('VoteSession not found');
    }


    // Reveal or Next question
    if (action === 'reveal') {
      voteSession.revealFlag = true;
      await voteSession.save();
    
      const participants = await Participant.find({ 
        'submissions.voteSession': voteSessionId 
      });
    
      const currentQuestionNumber = voteSession.questions[voteSession.voteFlag].questionNumber;
      const questionVoteCounts = {};
    
      voteSession.questions[voteSession.voteFlag].options.forEach((option) => {
        questionVoteCounts[option] = 0;  
      });
    
      participants.forEach((participant) => {
        participant.submissions.forEach((submission) => {
          if (submission.voteSession.toString() === voteSessionId) {
            submission.votes.forEach((vote) => {
              if (vote.questionNumber === currentQuestionNumber) {
                const selectedOption = vote.selectedOption;
                if (questionVoteCounts[selectedOption] !== undefined) {
                  questionVoteCounts[selectedOption] += 1;
                }
              }
            });
          }
        });
      });
    
      // Emit 'revealResults' event to participants
      req.io.to(`session_${voteSession.code}`).emit('revealResults', {
        questionNumber: currentQuestionNumber,
        voteCounts: questionVoteCounts,
      });
    
      // Redirect back to the same question panel, passing the revealFlag
      res.redirect(`/organizer/dashboard/questionPanel/${voteSessionId}`);

    } else {

      voteSession.voteFlag += 1;
      voteSession.revealFlag = false;
      await voteSession.save();

      // Determine if the vote has just started
      if (voteSession.voteFlag === 0) {
        // Emit 'voteStarted' event to all participants in the session room
        req.io.to(`session_${voteSession.code}`).emit('voteStarted', {
          voteSessionId: voteSession._id,
          code: voteSession.code,
        });
      }

      // 'voteStarted' event for lobby
      if (voteSession.voteFlag == 0) {
        req.io.to(`session_${voteSession.code}`).emit('voteStarted', {
          voteFlag: voteSession.voteFlag,
          questionNumber: voteSession.questions[voteSession.voteFlag].questionNumber,
        });
      }

      // Optionally, emit 'nextQuestion' event for subsequent questions
      if (voteSession.voteFlag > 0 && voteSession.voteFlag < voteSession.questions.length) {
        req.io.to(`session_${voteSession.code}`).emit('nextQuestion', {
          voteFlag: voteSession.voteFlag,
          questionNumber: voteSession.questions[voteSession.voteFlag].questionNumber,
        });
      }

      // Redirect to the appropriate page based on voteFlag and emit
      if (voteSession.voteFlag >= voteSession.questions.length) {
        req.io.to(`session_${voteSession.code}`).emit('voteEnd');

        res.redirect(`/organizer/dashboard/questionPanelEnd/${voteSessionId}`);
      } else {
        res.redirect(`/organizer/dashboard/questionPanel/${voteSessionId}`);
      }
    }
  } catch (error) {
    console.error(error);
    res.render('controlPanel', { voteSession: [], error: 'An error occurred while starting the vote.' });
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
