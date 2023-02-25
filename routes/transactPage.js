var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    // Get the account number
    switch (Number(req.session.userRole)) {
      // Customer
      case 1:
      // Admin
      case 3:
        res.redirect("/");
        break;
      // Employee
      case 2:
        res.render("transactPage", {});
        break;
    }
  }
});

router.post("/", function (req, res, next) {
  console.log("transactPage.js POST");

  let obj = new Object();
  obj.accountNumber = req.body.accountNumber;

  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  }
  else{
    switch (Number(req.session.userRole)) {
      // Customer
      case 1:
      // Admin
      case 3:
        res.redirect("/");
        break;
      // Employee
      case 2:
        step0Transact(obj, req, res);
        break;
    }
  }
});

function step0Transact(obj, req, res){
  // We know if its a withdraw of deposit so do that action
  if (
    req.body.amount &&
    req.body.accountType &&
    req.body.administration &&
    req.body.accountNumber
  ) {
    console.log("transactPage.js deposit/withdraw");

    obj.accountNumber = req.body.accountNumber;
    obj.accountType = req.body.accountType;
    obj.amount = req.body.amount;
    obj.memo = req.body.memo;
    obj.administration = req.body.administration;
    // From transactPageResults.ejs - To transactPageRSuccess.ejs
    step1TransactResult(obj, res);
  }
  // Have the account number - so disaplay if they want to do a deposit/withdraw
  else {
    // From transact.ejs - To transactPageResults.ejs
    step1Transact(obj, res);
  }
}

// Make sure the account number is valid
function step1Transact(obj, res) {
  console.log("transactPage.js get info to deposit/withdraw");

  //Check to make sure account exists
  const sql = "CALL check_accountNumber(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }

    console.log(rows[0]);
    // if account does not exist
    if (rows[0][0].result == 0) {
      res.render("transactPage", {
        message: "Account number: " + obj.accountNumber + " does not exist.",
      });
    } else {
      step2Transact(obj, res);
    }
  });
}

// Get account balance
function step2Transact(obj, res) {
  const sql = "CALL get_account_balance(?)";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }

    // Get the customers accounts
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    obj.checkingAccountBalance = formatter.format(rows[0][0].balance);
    obj.savingAccountBalance = formatter.format(rows[0][1].balance);
    obj.checkingAccountNumber = rows[0][0].balance || 0;
    obj.savingAccountNumber = rows[0][1].balance || 0;
    step3Transact(obj, res);
  });
}

// Get first and last name
function step3Transact(obj, res) {
  // Get user fist and last name
  const sql = "CALL getAccountName(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    console.log(rows[0][0]);

    obj.firstName = rows[0][0].firstName;
    obj.lastName = rows[0][0].lastName;

    res.render("transactPageResults", {
      checkingAccount: obj.checkingAccountBalance,
      savingAccount: obj.savingAccountBalance,
      checkingAccountNumber: obj.checkingAccountNumber,
      savingAccountNumber: obj.savingAccountNumber,
      firstName: obj.firstName,
      lastName: obj.lastName,
      accountNumber: obj.accountNumber,
    });
  });
}

function step1TransactResult(obj, res) {
  // Get the customers accounts
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  obj.formatedAmount = formatter.format(obj.amount);

  // is it a deposit
  if (obj.administration == "deposit") {
    const sql = "CALL deposit(?,?,?, ?, @result)";
    dbCon.query(
      sql,
      [obj.accountNumber, obj.accountType, obj.amount, obj.memo],
      function (err, rows) {
        if (err) {
          throw err;
        }
        res.render("transactPageSuccessful", {
          message:
            "Successfully deposited " +
            obj.formatedAmount +
            " into account #" +
            obj.accountNumber,
          accountNumber: obj.accountNumber,
        });
      }
    );
  }
  // is it a withdraw
  else {
    const sql = "CALL withdraw(?,?,?, NULL, @result)";
    dbCon.query(
      sql,
      [obj.accountNumber, obj.accountType, obj.amount, obj.memo],
      function (err, rows) {
        if (err) {
          throw err;
        }
        res.render("transactPageSuccessful", {
          message:
            "Successfully withdrawed " +
            obj.formatedAmount +
            " from account #" +
            obj.accountNumber,
          accountNumber: obj.accountNumber,
        });
      }
    );
  }
}

module.exports = router;
