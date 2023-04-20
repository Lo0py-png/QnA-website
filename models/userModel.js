var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
    'username': String,
    'email': String,
    'password': String,
    'profilePicture': { type: String, default: '/images/default.jpg' },
    'numQuestions': { type: Number, default: 0 },
    'numAnswers': { type: Number, default: 0 },
    'numAcceptedAnswers': { type: Number, default: 0 }
});



userSchema.statics.authenticate = async function (username, password, callback) {
	try {
	  const user = await User.findOne({ username });
  
	  if (!user) {
		const err = new Error('User not found');
		err.status = 401;
		return callback(err);
	  }
  
	  bcrypt.compare(password, user.password, function (err, result) {
		if (err) {
		  console.log('Error during password comparison:', err);
		  return callback(err);
		}
  
		console.log('Password comparison result:', result);
  
		if (result === true) {
		  return callback(null, user);
		} else {
		  const err = new Error('Wrong password');
		  err.status = 401;
		  return callback(err);
		}
	  });
	} catch (err) {
	  console.log('Error during user search:', err);
	  return callback(err);
	}
};

  
  
  


userSchema.pre('save', async function (next) {
	const user = this;
  
	// Only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) {
	  return next();
	}
  
	try {
	  const hash = await bcrypt.hash(user.password, 10);
	  user.password = hash;
	  next();
	} catch (err) {
	  return next(err);
	}
  });
  

var User = mongoose.model('user', userSchema);
module.exports = User;
