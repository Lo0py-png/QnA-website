const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: 'user' }
});

module.exports = mongoose.model('Answer', AnswerSchema);
