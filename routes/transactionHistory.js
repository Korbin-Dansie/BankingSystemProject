var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('tranactionHistory.js GET');
  if (!req.session.loggedIn || req.session.loggedIn == false){
    res.redirect('/');
  }
  else{
    const sql = "CALL `get_account_transaction_history`(?);";
    dbCon.query(sql, [req.session.accountNumber], function(err, rows){
      if(err){
        throw err;
      }
      console.log(rows[0]);
      res.render('transactionHistory', {transactionHistory: rows[0]});
    }); // End of query
  }
});

module.exports = router;