// routes/index.js
const express = require('express');
const router = express.Router();
const VoteSession = require('../models/VoteSession');

// POST Home Page
router.post('/', async (req, res) => {
  try {
    const code = req.body.sessionCode;
    res.redirect(`/join/${code}`);
  } catch (error) {
    console.error(error);
    res.render('home', { error: 'An error occurred. Please try again.' });
  }

});


// GET name Page
router.get('/join/:voteSessionCode', async (req, res) => {
  try {
    const code = req.params.voteSessionCode;
    const voteSession = await VoteSession.findOne({ code: code });
    
    if (!voteSession) {
        return res.render('home', { error: 'Please try a valid session code' });
      }

    res.render('join', {code: code});
  } catch (error) {
    console.error(error);
    res.render('home', { error: 'An error occurred. Please try again.' });
  }
});


// POST name Page
router.post('/join/:voteSessionCode', async (req, res) => {
  try {

    const code = req.params.voteSessionCode;
    const voteSession = await VoteSession.findOne({ code: code });
    
    let name = req.body.name;
    let emoji = req.body.emoji;
    if(emoji==''){
      emoji='😀';
    }

    voteSession.participants.push({
      name: name,
      emoji: emoji,
    });

    await voteSession.save()
    res.redirect(`/lobby/${code}`);
  } catch (error) {
    console.error(error);
    res.render('home', { error: 'An error occurred. Please try again.' });
  }
});




// GET Lobby Page
router.get('/lobby/:voteSessionCode', async (req, res) => {
  try {
    const code = req.params.voteSessionCode;
    const voteSession = await VoteSession.findOne({ code: code });
    
    res.render('lobby', {voteSession: voteSession});
  } catch (error) {
    console.error(error);
    res.render('join', { error: 'An error occurred. Please try again.' });
  }
});









module.exports = router;
