var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('register', { });
});


/* GET home page. */
router.post('/', function(req, res, next) {
  res.render('register', { message: "You have succesfuly registered the new account number is ######"});
});

module.exports = router;