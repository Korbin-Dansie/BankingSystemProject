var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('transfer', { });
});


/* GET home page. */
router.post('/', function(req, res, next) {
  res.render('transfer', { message: "You have succesfuly transfered funds"});
});

module.exports = router;