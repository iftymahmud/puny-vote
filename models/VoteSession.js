// models/Session.js
const mongoose = require('mongoose');

const VoteSessionSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  code: { type: String, unique: true },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VoteSession', VoteSessionSchema);
