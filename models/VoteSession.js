// models/VoteSession.js
const mongoose = require('mongoose');



const QuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  voteType: { type: String, enum: ['fibonacci', 'tshirt', 'custom'], required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
});


const VoteSessionSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  code: { type: String, unique: true },
  dateCreated: { type: Date, default: Date.now },
  questions: [QuestionSchema],
  voteSessionSubmitted: { type: String, enum: ['yes', 'no'], default: 'no' },
  voteFlag: { type: Number, default: -1 },
});

module.exports = mongoose.model('VoteSession', VoteSessionSchema);

