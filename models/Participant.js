// models/Participant.js
const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },  
  selectedOption: { type: String, required: true }, 
});

const VoteSubmissionSchema = new mongoose.Schema({
  voteSession: { type: mongoose.Schema.Types.ObjectId, ref: 'VoteSession', required: true }, 
  votes: [VoteSchema], 
});

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  code: { type: String, required: true },
  dateCreated: { type: Date, default: Date.now },
  submissions: [VoteSubmissionSchema]  
});

module.exports = mongoose.model('Participant', ParticipantSchema);
