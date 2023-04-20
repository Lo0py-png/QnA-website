const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String, default: null },],
  createdAt: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer', default: null },],
  acceptedAnswer: { type: Schema.Types.ObjectId, ref: 'Answer', default: null },
  upvoteCount: { type: Number, default: 0 },
  downvoteCount: { type: Number, default: 0 },
  upvoters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  downvoters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
});

module.exports = mongoose.model('Question', QuestionSchema);
