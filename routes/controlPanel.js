// routes/controlPanel.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const VoteSession = require('../models/VoteSession');
const Participant = require('../models/Participant');
const QRCode = require('qrcode');

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

    // Generate QR Code URL
    const joinUrl = `${req.protocol}://${req.get('host')}/join/${voteSession.code}`;
    const qrCodeDataURL = await QRCode.toDataURL(joinUrl, {
      color: {
        dark: '#FFFFFF',  // White dots
        light: '#000000'  // Black background
      },
      width: 200,          
      margin: 1            
    });



    // Join the Socket.IO room
    const voteSessionCode = voteSession.code;
    req.io.on('connection', (socket) => {
      socket.join(`session_${voteSessionCode}`);
    });

    res.render('controlPanel', { voteSession, participant, qrCodeDataURL });
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

    // Fetch all participants who have joined the session
    const participants = await Participant.find({ code: voteSession.code });

    const currentQuestionNumber = voteSession.questions[voteSession.voteFlag].questionNumber;

    // Initialize voteCounts
    const voteCounts = {};

    voteCounts[currentQuestionNumber] = {};

    const currentQuestion = voteSession.questions[voteSession.voteFlag];
    currentQuestion.options.forEach((option) => {
      voteCounts[currentQuestionNumber][option] = 0;
    });

    // Create a map to track which participants have voted
    const participantsVoteStatus = {};

    // Initialize all participants as not voted
    participants.forEach((p) => {
      participantsVoteStatus[p._id] = {
        name: p.name,
        emoji: p.emoji,
        hasVoted: false,
      };
    });

    // Update the vote status based on submissions
    participants.forEach((p) => {
      if (p.submissions && p.submissions.length > 0) {
        p.submissions.forEach((submission) => {
          if (submission.voteSession.toString() === voteSessionId) {
            submission.votes.forEach((vote) => {
              if (vote.questionNumber === currentQuestionNumber) {
                const selectedOption = vote.selectedOption;

                // Update the participant's vote status
                participantsVoteStatus[p._id].hasVoted = true;

                // Update the vote counts
                if (voteCounts[currentQuestionNumber][selectedOption] !== undefined) {
                  voteCounts[currentQuestionNumber][selectedOption] += 1;
                }
              }
            });
          }
        });
      }
    });

    const revealFlag = voteSession.revealFlag || false;

    // Pass participantsVoteStatus to the view
    res.render('questionPanel', { voteSession, voteCounts, revealFlag, participantsVoteStatus });
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

    } else if (action === 'retake') {

      const currentQuestionNumber = voteSession.questions[voteSession.voteFlag].questionNumber;
      const participants = await Participant.find({ 'submissions.voteSession': voteSessionId });

      for (const participant of participants) {
        const submission = participant.submissions.find(sub => sub.voteSession.toString() === voteSessionId);
        if (submission) {
          submission.votes = submission.votes.filter(vote => vote.questionNumber !== currentQuestionNumber);
          await participant.save();
        }
      }

      req.io.to(`session_${voteSession.code}`).emit('retakeQuestion', {
        questionNumber: currentQuestionNumber,
      });

      // Redirect back to the same question panel
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

    voteSession.voteFlag = -2;
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
