var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("transfer.js GET");
  res.locals.userRole = req.session.userRole;

  let obj = new Object();
  obj.accountNumber = req.session.accountNumber;

  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    step1TransferGet(obj, res);
  }
});

/* POST home page. */
router.post("/", function (req, res, next) {
  console.log("transfer.js POST");
  res.locals.userRole = req.session.userRole;

  let obj = new Object();

  obj.accountNumber = req.session.accountNumber;

  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    obj.fromAccountType = req.body.fromAccount || 0;
    obj.toAccountNumber = req.body.toAccount || 0;
    obj.toAccountType = req.body.toAccountType || 0;
    obj.amount = req.body.amount || 0;
    obj.memo = req.body.memo;
    step1TransferPost(obj, res);
  }
});

// Get the current balance of the bankaccounts
function step1TransferGet(obj, res) {
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
    // obj.checkingAccountNumber = rows[0][0].balance || 0;
    // obj.savingAccountNumber = rows[0][1].balance || 0;
    res.render("transfer", {
      checkingAccount: obj.checkingAccountBalance,
      savingAccount: obj.savingAccountBalance,
    });
  });
}

// Transfer the money
function step1TransferPost(obj, res) {
  // If feilds are empty do not accept query
  const sql = "CALL `user_transfer`(?,?,?,?,?,?,@result); select @result;";
  dbCon.query(
    sql,
    [
      obj.accountNumber,
      obj.fromAccountType,
      obj.toAccountNumber,
      obj.toAccountType,
      obj.amount,
      obj.memo,
    ],
    function (err, rows) {
      if (err) {
        throw err;
      }

      // See if transaction is good
      console.log("Transaction Result: 1=Good, 0=Bad");
      console.log(rows[1][0]["@result"]);
      const result = rows[1][0]["@result"];
      obj.result = result;
      step2TransferPost(obj, res);
    }
  );
}


// Get the current balance of the bankaccounts
function step2TransferPost(obj, res) {
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
    // obj.checkingAccountNumber = rows[0][0].balance || 0;
    // obj.savingAccountNumber = rows[0][1].balance || 0;
    if (obj.result) {
      const icon =
        '<i class="pull-right text-success bi bi-check-circle-fill "></i>';
      res.render("transfer", { message: icon + " Transaction Successful",      checkingAccount: obj.checkingAccountBalance,
      savingAccount: obj.savingAccountBalance,
 });
    }
    // If transaction is not good display an error
    else {
      const icon =
        '<i class="pull-right text-danger bi bi-x-circle-fill "></i>';
      res.render("transfer", {
        message: icon + " There was an error with the transaction",      checkingAccount: obj.checkingAccountBalance,
        savingAccount: obj.savingAccountBalance,
  
      });
    }
  });
}

module.exports = router;
