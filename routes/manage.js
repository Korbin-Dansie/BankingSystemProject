var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("mange.js GET");
  res.locals.userRole = req.session.userRole;


  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    switch (Number(req.session.userRole)) {
      // Customer
      case 1:
      // Employee
      case 2:
        res.redirect("/");
        break;
      // Admin
      case 3:
        res.render("manage", {});
        break;
    }
  }
});

router.post("/", function (req, res, next) {
  console.log("mange.js POST");
  res.locals.userRole = req.session.userRole;

  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    switch (Number(req.session.userRole)) {
      // Customer
      case 1:
      // Employee
      case 2:
        res.redirect("/");
        break;
      // Admin
      case 3:
        let obj = new Object();
        obj.accountNumber = req.body.accountNumber;

        // Check if submited updating uuser permisions
        if (req.body.administration && req.body.accountNumber) {
          obj.administration = req.body.administration;
          // From manageResults.ejs - To Home
          step1ManagePassword(obj, res);
        } else {
          // Check if account number exists
          // From manage.ejs - To manageResults.ejs
          step1Manage(obj, res);
        }
        break;
    }
  }
});

// Make sure the account exists - if not show an error
function step1Manage(obj, res) {
  const sql = "CALL check_accountNumber(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    console.log(rows[0]);
    // if account does not exist
    if (rows[0][0].result == 0) {
      res.render("manage", {
        message: "Account number: " + obj.accountNumber + " does not exist.",
      });
    } else {
      step2Manage(obj, res);
    }
  });
}

// Get the account name
function step2Manage(obj, res) {
  const sql = "CALL getAccountName(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    console.log(rows[0]);
    obj.firstName = rows[0][0].firstName;
    obj.lastName = rows[0][0].lastName;
    step3Manage(obj, res);
  });
}

// Get their current role - display the result page
function step3Manage(obj, res) {
  const sql = "CALL getUserRole(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    console.log(rows[0]);
    obj.userRole = rows[0][0].user_type;
    res.render("manageResults", {
      accountNumber: obj.accountNumber,
      lastName: obj.lastName,
      firstName: obj.firstName,
      userRole: obj.userRole,
    });
  });
}

// Update the user account role - then redirect to home page
function step1ManagePassword(obj, res) {
  const sql = "CALL setUserRole(?,?);";
  dbCon.query(
    sql,
    [obj.accountNumber, obj.administration],
    function (err, rows) {
      if (err) {
        throw err;
      }
      res.redirect("/");
    }
  );
}
module.exports = router;
