var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Landing Page: GET');

  if (!req.session.loggedIn || req.session.loggedIn == false){
    res.redirect('/');
  }
  // Get the account balances to display on the landing page
  else{
    let sql = "CALL get_account_balance(?);";
    dbCon.query(sql, [req.session.accountNumber], function (err, rows) {
      if (err) {
        throw err;
      }
      console.log('Balance of the accounts is: ');
      console.log(rows[0]);
  
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
  
      const checkingAccountBalance = formatter.format(rows[0][0].balance);
      const savingAccountBalance = formatter.format(rows[0][1].balance);

      // Display the landing page
      res.render('landingPage', { checkingAccount: checkingAccountBalance, savingAccount: savingAccountBalance});
    });  
  }
});


/* POST home page. */
router.post('/', function(req, res, next) {
  // If we post to the landing page redirect to the GET
  console.log('Landing Page: POST');
  data = req.body;
  res.redirect('/');
}); 
module.exports = router;