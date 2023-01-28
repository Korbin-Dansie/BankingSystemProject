var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('transactPage', { });
});


router.post('/', function(req, res, next) {
  res.render('transactPageResults', { });
});

module.exports = router;