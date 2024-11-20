// routes/organizer.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const VoteSession = require('../models/VoteSession');
const Participant = require('../models/Participant');
const { OpenAI } = require('openai');


// GET Dashboard Only
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {

    await VoteSession.deleteMany({
      organizer: req.session.userId,
      voteSessionSubmitted: 'no',
    });

    const voteSession = await VoteSession.find({ organizer: req.session.userId });
    
    res.render('dashboard', { voteSession });
  } catch (error) {
    console.error(error);
    res.render('dashboard', { voteSession: [] });
  }
});

// GET Dashboard with VoteSession
router.get('/dashboard/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    
    const voteSession = await VoteSession.find({ organizer: req.session.userId });
    
    const updateVoteSessionSubmitted = await VoteSession.findOne({
      organizer: req.session.userId,
      _id: req.params.voteSessionId,
    });
    updateVoteSessionSubmitted.voteSessionSubmitted = 'yes';
    await updateVoteSessionSubmitted.save();

    
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
    res.redirect(`/organizer/create-questions/${voteSession._id}`);
  } catch (error) {
    console.error(error);
    res.render('createVoteSession', { error: 'An error occurred. Please try again.' });
  }
});



// GET AI-generated summary
router.get('/ai-summary/:voteSessionId', ensureAuthenticated, async (req, res) => {
  try {
    const { voteSessionId } = req.params;
    const voteSession = await VoteSession.findOne({
      _id: voteSessionId,
      organizer: req.session.userId,
    });

    if (!voteSession) {
      return res.status(404).render('error', { message: 'Vote session not found.' });
    }

    // Collect votes
    const participants = await Participant.find({
      'submissions.voteSession': voteSessionId,
    });

    let voteData = [];

    participants.forEach((participant) => {
      const submission = participant.submissions.find(sub => sub.voteSession.equals(voteSessionId));
      if (submission) {
        submission.votes.forEach((vote) => {
          voteData.push({
            participantName: participant.name,
            participantEmoji: participant.emoji,
            questionNumber: vote.questionNumber,
            selectedOption: vote.selectedOption,
          });
        });
      }
    });

    // Prepare prompt for OpenAI API
    let prompt = `Provide a summary/report of the given for the voting session titled "${voteSession.title}". You do not need to include all the info but the key insights. Provide one question and then the insights in a 1-3 sentence paragraph and so on. Please note that the questions can be connected or separate. Options containing Fibonacci and T-Shirt type questions are about level of difficulty. Add appropriate HTML tags to your output too. Do not give any intro, start with questions and insights. Do not write Question 1 and so on, write 1: Question Title and so on. make the question title h4 with text-info. Use Simple english.\n\n`;

    voteSession.questions.forEach((question) => {
      prompt += `Question ${question.questionNumber}: ${question.questionText}\nOptions:\n`;
      question.options.forEach((option) => {
        prompt += `- ${option}\n`;
      });
      prompt += 'Votes:\n';

      const votesForQuestion = voteData.filter(vote => vote.questionNumber === question.questionNumber);
      const optionCounts = {};
      votesForQuestion.forEach((vote) => {
        optionCounts[vote.selectedOption] = (optionCounts[vote.selectedOption] || 0) + 1;
      });

      Object.keys(optionCounts).forEach((option) => {
        prompt += `${option}: ${optionCounts[option]} votes\n`;
      });

      prompt += '\n';
    });


    // Call OpenAI API
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, 
    });

    const openAIResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      messages: [
        { role: 'system', content: 'You are an assistant that summarizes result in a voting app.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    

    const aiSummary = openAIResponse.choices[0].message.content.trim();

    res.render('aiSummary', { voteSession, aiSummary });

  } catch (error) {
    console.error(error);
    res.render('dashboard', { voteSession: [] });
  }
});

module.exports = router;