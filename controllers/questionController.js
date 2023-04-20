var QuestionModel = require('../models/questionModel.js');
var userController = require('../controllers/userController.js');


/**
 * questionController.js
 *
 * @description :: Server-side logic for managing questions.
 */
module.exports = {

    /**
     * questionController.list()
     */
    list: async function (req, res) {
        try {
            const questions = await QuestionModel.find();
            return res.json(questions);
        } catch (err) {
            console.error("Error details:", err);
            return res.status(500).json({
                message: 'Error when getting questions.',
                error: err
            });
        }
    },

    acceptAnswer: async function (req, res) {
        const questionId = req.params.questionId;
        const answerId = req.params.answerId;
    
        try {
            const question = await QuestionModel.findById(questionId).exec();
            if (!question) {
                return res.status(404).json({ message: 'No such question' });
            }
    
            const answer = await AnswerModel.findById(answerId).exec();
            if (!answer) {
                return res.status(404).json({ message: 'No such answer' });
            }
    
            // Update question and answer
            question.acceptedAnswer = answerId;
            answer.isSelected = true;
            await question.save();
            await answer.save();
    
            // Update user counters
            await userController.updateUserCounters(answer.author);
    
            return res.status(200).json({ message: 'Answer accepted' });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when accepting answer.',
                error: err
            });
        }
    },
    
    
    
    

    /**
     * questionController.show()
     */
    show: async function (req, res) {
        try {
            var id = req.params.id;
            const question = await QuestionModel.findById(id).populate('author').populate({
                path: 'answers',
                populate: {
                    path: 'author'
                }
            }).populate('acceptedAnswer').exec();
            
            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }
    
            return res.render('question/show', { question });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting question.',
                error: err
            });
        }
    },
    
    

  /**
 * questionController.create()
 */
  create: function (req, res) {
    console.log('req.session.user:', req.session.user);
    var question = new QuestionModel({
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
        createdAt: req.body.createdAt,
        author: req.session.userID,
        answers: req.body.answers,
        acceptedAnswer: req.body.acceptedAnswer
    });

    question.save()
        .then((question) => {
            // Update user counters
            userController.updateUserCounters(req.session.userID)
                .then(() => {
                    // Redirect to the landing page
                    return res.redirect('/');
                })
                .catch((err) => {
                    console.error('Error when updating user counters:', err);
                    return res.redirect('/');
                });
        })
        .catch((err) => {
            return res.status(500).json({
                message: 'Error when creating question',
                error: err
            });
        });
},


    /**
     * questionController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        QuestionModel.findOne({_id: id}, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }

            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            question.title = req.body.title ? req.body.title : question.title;
			question.description = req.body.description ? req.body.description : question.description;
			question.tags = req.body.tags ? req.body.tags : question.tags;
			question.createdAt = req.body.createdAt ? req.body.createdAt : question.createdAt;
			question.author = req.body.author ? req.body.author : question.author;
			question.answers = req.body.answers ? req.body.answers : question.answers;
			question.acceptedAnswer = req.body.acceptedAnswer ? req.body.acceptedAnswer : question.acceptedAnswer;
			
            question.save(function (err, question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating question.',
                        error: err
                    });
                }

                return res.json(question);
            });
        });
    },

    upvote: async function (req, res) {
        try {
            const questionId = req.params.id;
            const userId = req.session.userID;
    
            // Find the question
            const question = await QuestionModel.findById(questionId);
    
            // Check if the user has already upvoted
            if (question.upvoters.includes(userId)) {
                // Remove the upvote
                question.upvoters.pull(userId);
            } else {
                // Add the upvote
                question.upvoters.push(userId);
    
                // Check if the user has already downvoted
                if (question.downvoters.includes(userId)) {
                    // Remove the downvote
                    question.downvoters.pull(userId);
                }
            }
    
            // Update the upvote and downvote counts
            question.upvoteCount = question.upvoters.length;
            question.downvoteCount = question.downvoters.length;
    
            // Save the updated question
            await question.save();
            res.json({ upvoteCount: question.upvoteCount, downvoteCount: question.downvoteCount });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    
    
      
    downvote: async function (req, res) {
        try {
            const questionId = req.params.id;
            const userId = req.session.userID;
    
            // Find the question
            const question = await QuestionModel.findById(questionId);
    
            // Check if the user has already downvoted
            if (question.downvoters.includes(userId)) {
                // Remove the downvote
                question.downvoters.pull(userId);
            } else {
                // Add the downvote
                question.downvoters.push(userId);
    
                // Check if the user has already upvoted
                if (question.upvoters.includes(userId)) {
                    // Remove the upvote
                    question.upvoters.pull(userId);
                }
            }
    
            // Update the upvote and downvote counts
            question.upvoteCount = question.upvoters.length;
            question.downvoteCount = question.downvoters.length;
    
            // Save the updated question
            await question.save();
            res.json({ upvoteCount: question.upvoteCount, downvoteCount: question.downvoteCount });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },

    search: async function (req, res) {
        const tag = req.query.tag;
        const searchPerformed = !!tag;
      
        if (searchPerformed) {
          try {
            const questions = await QuestionModel.find({ tags: tag })
              .populate('author')
              .populate({
                path: 'answers',
                populate: { path: 'author' },
                options: { sort: { createdAt: -1 } },
              })
              .populate({
                path: 'acceptedAnswer',
                populate: { path: 'author' },
              })
              .sort({ createdAt: -1 });
            
            res.render('question/search', { questions, searchPerformed });
          } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error during search' });
          }
        } else {
          res.render('question/search', { searchPerformed });
        }
      },
      
    

    /**
     * questionController.remove()
     */
    remove: async function (req, res) {
        var id = req.params.id;
    
        try {
            await QuestionModel.findByIdAndRemove(id);
            return res.status(204).json();
        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting the question.',
                error: err
            });
        }
    }
    
};
