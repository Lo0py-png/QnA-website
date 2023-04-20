var AnswerModel = require('../models/answerModel.js');
const QuestionModel = require('../models/questionModel');


/**
 * answerController.js
 *
 * @description :: Server-side logic for managing answers.
 */
module.exports = {

/**
 * answerController.list()
 */
list: async function (req, res) {
    try {
        const userId = req.session.userID;
        const answers = await AnswerModel.find({ author: userId });
        return res.json(answers);
    } catch (err) {
        return res.status(500).json({
            message: 'Error when getting answer.',
            error: err
        });
    }
},


    /**
     * answerController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({_id: id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer.',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            return res.json(answer);
        });
    },

    /**
     * answerController.create()
     */
    create: async function (req, res) {
        var answer = new AnswerModel({
          content: req.body.content,
          createdAt: req.body.createdAt,
          author: req.session.userID,
        });
      
        try {
          // Retrieve the questionId from the request parameters
          const questionId = req.params.questionId;
          const question = await QuestionModel.findById(questionId);
      
          if (!question) {
            return res.status(404).json({
              message: 'No such question'
            });
          }
      
          // Add the new answer to the question and save both to the database
          question.answers.push(answer._id);
          await Promise.all([answer.save(), question.save()]);
      
          return res.status(201).json(answer);
        } catch (err) {
          console.error("Error details:", err);
          return res.status(500).json({
            message: 'Error when creating answer',
            error: err
          });
        }
    },
    
      
    

    /**
     * answerController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({_id: id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            answer.content = req.body.content ? req.body.content : answer.content;
			answer.createdAt = req.body.createdAt ? req.body.createdAt : answer.createdAt;
			answer.author = req.body.author ? req.body.author : answer.author;
			
            answer.save(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating answer.',
                        error: err
                    });
                }

                return res.json(answer);
            });
        });
    },

    /**
     * answerController.remove()
     */
    /**
 * answerController.remove()
 */
    remove: async function (req, res) {
        const answerId = req.params.id;
      
        try {
          const answer = await AnswerModel.findById(answerId);
          if (!answer) {
            return res.status(404).json({
              message: 'No such answer'
            });
          }
      
          if (answer.author.toString() !== req.session.userID) {
            return res.status(403).json({
              message: 'Not authorized to delete this answer'
            });
          }
      
          await AnswerModel.deleteOne({ _id: answerId });
          return res.status(204).json();
        } catch (err) {
          return res.status(500).json({
            message: 'Error when deleting the answer.',
            error: err
          });
        }
      }
      

};
