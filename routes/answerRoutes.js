var express = require('express');
var router = express.Router();
var answerController = require('../controllers/answerController.js');

/*
 * GET
 */
router.get('/', answerController.list);

/*
 * GET
 */
router.get('/:id', answerController.show);


// Add this route to create an answer for a specific question
router.post('/question/:questionId/answers', answerController.create);


/*
 * PUT
 */
router.put('/:id', answerController.update);

/*
 * DELETE
 */
router.delete('/:id', answerController.remove);

module.exports = router;
