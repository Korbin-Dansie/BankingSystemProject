var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("tranactionHistory.js GET");
  res.locals.userRole = req.session.userRole;

  let obj = new Object();
  obj.accountNumber = req.session.accountNumber;

  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    // From anywhere - To transactionHistory.ejs
    step1TransactionHistory(obj, res);
  }
});

// Get the account balance from the account number in session
function step1TransactionHistory(obj, res){
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
    step2TransactionHistory(obj, res);
  });
}

// Get all the rows of the transacion history and format them
function step2TransactionHistory(obj, res){
  const sql = "CALL `get_account_transaction_history`(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    // console.log(rows[0]);
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
