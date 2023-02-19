var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Landing Page: GET');
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

    res.render('landingPage', { checkingAccount: checkingAccountBalance, savingAccount: savingAccountBalance});
  });

});


/* POST home page. */
router.post('/', function(req, res, next) {
  console.log('Landing Page: POST');

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

    res.render('landingPage', { checkingAccount: checkingAccountBalance, savingAccount: savingAccountBalance});
  });
}); 
module.exports = router;