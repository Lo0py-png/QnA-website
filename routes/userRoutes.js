var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/profile_pictures/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/*
 * GET
 */
router.get('/', userController.list);
router.get('/login', userController.showLogin);
router.get('/register', userController.showRegister);
router.get('/profile', userController.profile);
router.get('/logout', userController.logout);
router.get('/my-questions', userController.myQuestions);

/*
 * GET
 */
router.get('/:id', userController.show);

/*
 * POST
 */
router.post('/', userController.create);
router.post('/login', userController.login);
router.post('/uploadProfilePicture', upload.single('profilePicture'), userController.uploadProfilePicture);

/*
 * PUT
 */
router.put('/:id', userController.update);

/*
 * DELETE
 */
router.delete('/:id', userController.remove);

module.exports = router;
