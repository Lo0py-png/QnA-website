var express = require('express');
var router = express.Router();
var questionController = require('../controllers/questionController.js');
const Question = require('../models/questionModel');
var userController = require('../controllers/userController.js');

/*
 * GET
 */
router.get('/', questionController.list);
router.get('/new', function(req, res) {
    res.render('question/new');
});
router.get('/search', questionController.search);


/*
 * GET
 */
router.get('/:id', questionController.show);


/*
 * POST
 */
router.post('/', questionController.create);

// Upvote and downvote routes
router.post('/:id/upvote', questionController.upvote);
router.post('/:id/downvote', questionController.downvote);
router.post('/:id/upvote/remove', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).send({ message: 'Question not found' });
    }

    // Remove user from upvoters
    question.upvoters.pull(req.user._id);

    // Update upvote count
    question.upvoteCount--;

    await question.save();

    res.send({ upvoteCount: question.upvoteCount, downvoteCount: question.downvoteCount });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error removing upvote' });
  }
});

router.post('/:id/downvote/remove', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).send({ message: 'Question not found' });
    }

    // Remove user from downvoters
    question.downvoters.pull(req.user._id);

    // Update downvote count
    question.downvoteCount--;

    await question.save();

    res.send({ upvoteCount: question.upvoteCount, downvoteCount: question.downvoteCount });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error removing downvote' });
  }
});


/*
 * PUT
 */
router.put('/:id', questionController.update);
router.put('/:questionId/accept-answer/:answerId', async (req, res) => {
  try {
      const question = await Question.findById(req.params.questionId);
      question.acceptedAnswer = req.params.answerId;
      await question.save();
      
      // Find the answer author and increment their acceptedAnswers counter
      const answer = question.answers.find(answer => answer._id.toString() === req.params.answerId);
      if (answer) {
        await userController.incrementAcceptedAnswers(answer.author);
      } else {
        throw new Error('Answer not found');
      }

      res.status(200).send('Accepted answer updated');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

/*
 * DELETE
 */
router.delete('/:id', questionController.remove);

module.exports = router;
