var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    res.render("transactPage", {});
  }
});

router.post("/", function (req, res, next) {
  console.log('transactPage.js POST');
  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } 
  // We know if its a withdraw of deposit so do that action
  else if(req.body.amount && req.body.accountType && req.body.administration && req.body.accountNumber){
    console.log('transactPage.js deposit/withdraw');

    const accountNumber = req.body.accountNumber;
    const accountType = req.body.accountType;
    const amount = req.body.amount;
    const memo = req.body.memo;

          // Get the customers accounts
          const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          });
    
          const formatedAmount = formatter.format(amount);
    
    // is it a deposit
    if(req.body.administration == 'deposit'){
      const sql = "CALL deposit(?,?,?, ?, @result)";
      dbCon.query(sql, [accountNumber, accountType, amount, memo], function(err, rows){
        if(err){
          throw err;
        }
        res.render('transactPageSuccessful', {
          message: 'Succesfuly deposited ' + formatedAmount + ' into account #' + accountNumber,
          accountNumber: accountNumber
        });
      });
    }
    // is it a withdraw
    else{
      const sql = "CALL withdraw(?,?,?, NULL, @result)";
      dbCon.query(sql, [accountNumber, accountType, amount, memo], function(err, rows){
        if(err){
          throw err;
        }
        res.render('transactPageSuccessful', {
          message: 'Succesfuly withdrawed ' + formatedAmount + ' into account #' + accountNumber,
          accountNumber: accountNumber
        });
      });
    }
  }
  // Have the account number - so disaplay if they want to do a deposit/withdraw
  else {
    console.log('transactPage.js get info to deposit/withdraw');
    const accountNumber = req.body.accountNumber;

    const sql = "CALL get_account_balance(?)";
    dbCon.query(sql, [accountNumber], function (err, rows) {
      if (err) {
        throw err;
      }

      // Get the customers accounts
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });

      const checkingAccountBalance = formatter.format(rows[0][0].balance);
      const savingAccountBalance = formatter.format(rows[0][1].balance);
      const checkingAccountNumber =  rows[0][0].balance;
      const savingAccountNumber = rows[0][1].balance;

      // Get user fist and last name
      const sql = "CALL getAccountName(?);";
      dbCon.query(sql, [accountNumber], function(err, rows){
        if(err){
          throw err;
        }
        console.log(rows[0][0]);

        const firstName = rows[0][0].firstName;
        const lastName = rows[0][0].lastName;

        res.render("transactPageResults", {
          checkingAccount: checkingAccountBalance,
          savingAccount: savingAccountBalance,
          checkingAccountNumber: checkingAccountNumber,
          savingAccountNumber: savingAccountNumber,
          firstName: firstName,
          lastName: lastName,
          accountNumber: accountNumber,
        });
      });

    });
  }
});

module.exports = router;
