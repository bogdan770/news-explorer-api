const router = require('express').Router();

const signin = require('./registration');
const signup = require('./login');
const articles = require('./articles');
const users = require('./users');

router.use('/', signin);
router.use('/', signup);
router.use('/', articles);
router.use('/', users);

module.exports = router;
