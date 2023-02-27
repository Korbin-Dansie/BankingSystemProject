var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("tranactionHistory.js GET");
  res.locals.userRole = req.session.userRole;
  console.log("UserRole: " + Number(req.session.userRole));

  let obj = new Object();
  obj.accountNumber = req.session.accountNumber;

  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    // From anywhere - To transactionHistory.ejs
    switch (Number(req.session.userRole)) {
      // Customer -
      case 1:
       // Admin - 
      case 3:
        obj.accountNumber = req.session.accountNumber;
        step1TransactionHistory(obj, res);
        break;
      // Employee
      case 2:
        res.render("transactionHistorySelect");
        break;

    }
  }
});

/* POST home page. */
router.post("/", function (req, res, next) {
  console.log("tranactionHistory.js POST");
  res.locals.userRole = req.session.userRole;

  let obj = new Object();
  obj.accountNumber = req.body.accountNumber;

  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  }
  else{
    switch (Number(req.session.userRole)) {
      // Customer -
      case 1:
       // Admin - 
      case 3:
        obj.accountNumber = req.session.accountNumber; 
      // Employee - account number from body is set before switch statment
      case 2:
        step1TransactionHistory(obj, res);
        break;
    }
  }
});

// Check if account number is valid
// See if account number exists
function step1TransactionHistory(obj, res) {
  // Check if account exists
  const sql = "CALL check_accountNumber(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }

    console.log(rows[0]);
    console.log(obj);
    // if account does not exist
    if (rows[0][0].result == 0) {
      res.render("transactionHistorySelect", {
        message: "Account number: " + obj.accountNumber + " does not exist.",
      });
    }
    // If account does exist
    else {
      step2TransactionHistory(obj, res);
    }
  });
}


// Get the account balance from the account number in session
function step2TransactionHistory(obj, res){
  let sql = "CALL get_account_balance(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    obj.checkingAccountBalance = formatter.format(rows[0][0].balance);
    obj.savingAccountBalance = formatter.format(rows[0][1].balance);
    step3TransactionHistory(obj, res);
  });
}

// Get all the rows of the transacion history and format them
function step3TransactionHistory(obj, res){
  const sql = "CALL `get_account_transaction_history`(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    // Alter the transaction into the correct format
    const moneyFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#examples
    let options = {
      //weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    rows[0].forEach((element) => {
      // Alter the tranaction amount to inclue (+ / -) and in money format
      const transactionAmount = moneyFormatter.format(
        element.transaction_amount
      );
      let isNegitive = element.isDeposit == 1 ? "+" : "-";
      element.transaction_amount = isNegitive + transactionAmount;

      // Alter the date to be in mm/dd/yyyy
      const date = new Date(element.transaction_time);
      element.transaction_time = date.toLocaleTimeString("en-US", options);
    });

    res.render("transactionHistory", {
      transactionHistory: rows[0],
      checkingAccount: obj.checkingAccountBalance,
      savingAccount: obj.savingAccountBalance,
    });
  }); // End of query    });
}
module.exports = router;
