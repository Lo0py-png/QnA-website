var UserModel = require('../models/userModel.js');
var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/answerModel.js');


async function updateUserCounters(userId) {
    const user = await UserModel.findById(userId).exec();
    if (user) {
      const questionsCount = await QuestionModel.countDocuments({ author: userId }).exec();
      const answersCount = await AnswerModel.countDocuments({ author: userId }).exec();
      const selectedAnswersCount = await AnswerModel.countDocuments({ author: userId, isSelected: true }).exec();
  
      user.questionsCount = questionsCount;
      user.answersCount = answersCount;
      user.selectedAnswersCount = selectedAnswersCount;
  
      const updatedUser = await user.save();
      return updatedUser;
    }
  }
  

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    updateUserCounters: updateUserCounters,
    

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    showLogin: function(req, res){
        res.render('user/login');
    },
    
    showRegister: function(req, res){
        res.render('user/register');
    },

    /**
     * userController.show()
     */
    show: async function (req, res) {
        var id = req.params.id;
    
        try {
            const user = await UserModel.findOne({ _id: id });
            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
            return res.json(user);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting user.',
                error: err
            });
        }
    },

    myQuestions: async function (req, res, next) {
        try {
            const user = await UserModel.findById(req.session.userID).exec();
            if (!user) {
                var error = new Error("Not authenticated. Go back!");
                error.status = 401;
                return next(error);
            } else {
                const questions = await QuestionModel.find({ author: user._id })
                    .populate({ path: 'answers', populate: { path: 'author' }})
                    .lean()
                    .exec();
    
                console.log(questions);
                res.render('user/my-questions', { user, questions });
            }
        } catch (error) {
            return next(error);
        }
    },
    
    incrementAcceptedAnswers: async function (userId) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            user.acceptedAnswers++;
            await user.save();
        } catch (err) {
            console.error('Error when incrementing acceptedAnswers:', err);
            throw err;
        }
    },
    
    


    login: function(req, res, next) {
        const { username, password } = req.body;
        UserModel.authenticate(username, password, function(err, user) {
            if (err || !user) {
                var err = new Error("Wrong username or password");
                err.status = 401;
                return next(err);
            } else {
                req.session.userID = user._id;
                return res.redirect('/');
            }
        });
    },
    

    profile: async function (req, res, next) {
        try {
            const user = await UserModel.findById(req.session.userID).exec();
            if (!user) {
                var error = new Error("Not authenticated. Go back!");
                error.status = 401;
                return next(error);
            } else {
                const updatedUser = await updateUserCounters(user._id);
                res.render('./user/profile', updatedUser);
            }
        } catch (error) {
            return next(error);
        }
    },
    

    


    logout: function (req, res, next) {
        console.log(req.session.userID); // add this line
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                }
                else {
                    return res.redirect('/users/login');
                }
            });
        }
    },
    

    /**
     * userController.create()
     */
    create: async function (req, res) {
        var user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            profilePicture: req.file ? '/uploads/profile_pictures/' + req.file.filename : ''
        });

        try {
            const savedUser = await user.save();
            return res.redirect('/users/login');
        } catch (err) {
            return res.status(500).json({
                message: 'Error when creating user',
                error: err
            });
        }
    },
    

    /**
     * userController.update()
     */
    update: async function (req, res) {
        var id = req.params.id;
    
        try {
            const user = await UserModel.findOne({ _id: id });
            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
    
            user.username = req.body.username ? req.body.username : user.username;
            user.email = req.body.email ? req.body.email : user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.file) {
                user.profilePicture = '/uploads/profile_pictures/' + req.file.filename;
            }
    
            const updatedUser = await user.save();
            return res.json(updatedUser);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when updating user.',
                error: err
            });
        }
    },
    

    uploadProfilePicture: async function (req, res, next) {
        try {
          const user = await UserModel.findById(req.session.userID).exec();
          console.log('user:', user); // add this line for debugging
          if (!user) {
            var error = new Error("Not authenticated. Go back!");
            error.status = 401;
            return next(error);
          } else {
            if (req.file) {
              user.profilePicture = '/uploads/profile_pictures/' + req.file.filename;
              const updatedUser = await updateUserCounters(user._id);
              user.numQuestions = updatedUser.numQuestions;
              user.numAnswers = updatedUser.numAnswers;
              user.numAcceptedAnswers = updatedUser.numAcceptedAnswers;
              await user.save();
            }
      
            console.log('Profile picture uploaded successfully');
            return res.redirect('/users/profile');
          }
        } catch (error) {
          return next(error);
        }
      },
      
    

    
    
    

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
