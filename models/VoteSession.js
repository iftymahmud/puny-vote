// models/Session.js
const mongoose = require('mongoose');



const QuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  voteType: { type: String, enum: ['fibonacci', 'tshirt', 'custom'], required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
});


const ParticipantSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});


const VoteSessionSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  code: { type: String, unique: true },
  dateCreated: { type: Date, default: Date.now },
  questions: [QuestionSchema],
  voteSessionSubmitted: { type: String, enum: ['yes', 'no'], default: 'no' },
  participants: [ParticipantSchema],
});

module.exports = mongoose.model('VoteSession', VoteSessionSchema);

