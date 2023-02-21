var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', 
  { title: 'Express' ,
   accountNumber: req.session.accountNumber,
   loggedIn: req.session.loggedIn,
   userRole: req.session.userRole
  });
});

/* Log out*/
router.get('/logout', function(req, res){
  req.session.destroy(function(err){
    if(err){
      throw err;
    }
    res.redirect('/');
  });
});

module.exports = router;
