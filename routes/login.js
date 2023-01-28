var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { });
});

/* POST home page. */
router.post('/', function (req, res, next) {
  res.render('loginPassword', {});
});

module.exports = router;