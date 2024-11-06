// routes/questions.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const VoteSession = require('../models/VoteSession');

// GET Create Questions
router.get('/create-questions/:voteSessionId', ensureAuthenticated, async (req,res) => {
    const { voteSessionId } = req.params;

    try {
      const voteSession = await VoteSession.findOne({_id: voteSessionId, organizer: req.session.userId})

      let nextQuestionNo = voteSession.questions.length + 1;

      let lastType = "fibonacci"
      if(voteSession.questions.length > 0){
        lastType = voteSession.questions[voteSession.questions.length-1].voteType;
      }

      res.render('createQuestions', {voteSessionTitle: voteSession.title, voteSessionId: voteSession._id, questionNo: nextQuestionNo, lastType: lastType});

    } catch (error) {
      console.error(error);
      res.render('createVoteSession', { error: "An Error occured while adding questions. Please try again"})
    }
  });

  //POST Create Questions
  router.post('/create-questions/:voteSessionId', ensureAuthenticated, async (req,res) => {

    const { voteSessionId } = req.params;
    const { title, voteType, o1, o2, o3, o4, o5, o6 } = req.body;

    const options = [];
    const addOption = (option) => {
      if (typeof option === 'string' && option.trim() !== "") {
          options.push(option.trim());
      }
    };
  
    addOption(o1);
    addOption(o2);
    addOption(o3);
    addOption(o4);
    addOption(o5);
    addOption(o6);

    try {
      let voteSession = await VoteSession.findOne({_id: voteSessionId, organizer: req.session.userId})

      let currentQuestionNumber = voteSession.questions.length + 1;

      voteSession.questions.push ({
        questionNumber: currentQuestionNumber,
        voteType: voteType,
        questionText: title,
        options: options,
      });

      await voteSession.save();
      res.redirect(`/organizer/create-questions/${voteSession._id}`);
    } catch (error) {
      console.error(error);
      res.render('createQuestions', { error: "An Error occured while adding questions. Please try again", })
    }
  });

  
  // POST Create Questions
  //TBW

module.exports = router;

