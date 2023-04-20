var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1/vaja3Final';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, "MongoDB connection error."));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');


var app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: mongoDB})
}));

app.use(async function (req, res, next) {
  try {
    const user = await UserModel.findById(req.session.userID).exec();
    if (user === null) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  } catch (error) {
    return next(error);
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));



const methodOverride = require('method-override');

app.use(methodOverride('_method'));


// Import answer routes
const answerRoutes = require('./routes/answerRoutes');

// Use answer routes
app.use('/answers', answerRoutes);

const hbs = require('hbs');

hbs.registerHelper('isLoggedIn', function(user) {
  return user && user._id;
});

hbs.registerHelper('if_eq', function(a, b, options) {
  const user = options.hash.user;
  const author = options.hash.author;

  if (String(user) === String(author)) {
    return options.fn(this);
  }
  return options.inverse(this);
});





hbs.registerHelper('eq', function (a, b) {
  return a && b && a.toString() === b.toString();
});

hbs.registerHelper('unless_eq', function (a, b, opts) {
  if (a && b && a.toString() !== b.toString()) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});
hbs.registerHelper('userIsAuthor', function(user, author) {
  if (!user || !author) return false;
  return user.toString() === author.toString();
});

hbs.registerHelper('findAnswerById', function (answers, id) {
  return answers.find(answer => answer._id.toString() === id.toString());
});



hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

const fs = require('fs');

const partialsPath = path.join(__dirname, 'views/question/');
const partialFiles = fs.readdirSync(partialsPath);

partialFiles.forEach((file) => {
  if (file.match(/^_.*\.hbs$/)) {
    const partialName = path.basename(file, '.hbs');
    const partialTemplate = fs.readFileSync(path.join(partialsPath, file), 'utf8');
    hbs.registerPartial(partialName, partialTemplate);
  }
});





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// ...
// Other middleware and settings

const questionRoutes = require('./routes/questionRoutes');
app.use('/questions', questionRoutes);

// ...
// Error handling and other middleware

app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add required models
const QuestionModel = require('./models/questionModel');
const UserModel = require('./models/userModel');
app.use('/users', usersRouter);

// Create landing page route handler
app.get('/', async (req, res) => {
  try {
    const questions = await QuestionModel.find()
      .populate('author')
      .populate({
        path: 'answers',
        populate: { path: 'author' },
        options: { sort: { createdAt: -1 } },
      })
      .sort({ createdAt: -1 });
    const user = req.session.userID ? await UserModel.findById(req.session.userID) : null;
    
    res.render('index', { questions, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/questions/_questions-list', async (req, res) => {
  const tag = req.query.tag;
  const searchPerformed = !!tag;
  try {
    let questions = [];
    if (searchPerformed) {
      questions = await QuestionModel.find({ tags: tag })
        .populate('author')
        .populate({
          path: 'answers',
          populate: { path: 'author' },
          options: { sort: { createdAt: -1 } },
        })
        .populate('acceptedAnswer')
        .sort({ createdAt: -1 });
    }
    const user = req.session.userID ? await UserModel.findById(req.session.userID) : null;
    res.render('search', { questions, user, searchPerformed });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
