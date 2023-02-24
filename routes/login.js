var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("login.js: GET");
  res.render("login", {});
});

/* POST home page. */
router.post("/", function (req, res, next) {
  console.log("login.js: POST");
  // If hashed password exits then submiting password
  let obj = new Object();
  obj.accountNumber = req.body.accountNumber;

  // Have an account number but not a password
  if (req.body.hashedPassword) {
    obj.hashedPassword = req.body.hashedPassword;
    obj.salt = req.body.salt;
    step1Password(obj, res, req);
  }
  // Not logged in and have a accountNumber
  else if (req.body.accountNumber != "") {
    step1Login(obj, res);
  }
});

// Get the salt for the account - also make sure the account number exists
function step1Login(obj, res) {
  let sql = "CALL get_salt(?);";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    // If accountNumber is not in the database
    if (rows[0][0] === undefined) {
      console.log("login.js No results found");
      res.render("login", {
        message: `accountNumber: "${obj.accountNumber}" not found`,
      });
    } else {
      const salt = rows[0][0].salt;

      // Render password page - with account number and salt
      res.render("loginPassword", {
        accountNumber: obj.accountNumber,
        salt: salt,
      });
    }
  });
}

// Make sure the account number exists
function step1Password(obj, res, req) {
  const sql = "CALL check_Credentials(?,?);";
  dbCon.query(
    sql,
    [obj.accountNumber, obj.hashedPassword],
    function (err, rows) {
      if (err) {
        throw err;
      }
      console.log("Loginuser.js obtained password");
      // Credentials did not work
      if (rows[0][0] === undefined || rows[0][0].result == 0) {
        console.log("loginuser.js: No password credintails found");
        // Reprompt for the password
        res.render("loginPassword", {
          message:
            obj.accountNumber +
            ". Please log in again",
          accountNumber: obj.accountNumber,
          salt: obj.salt,
        });
      }
      // logged in correctly
      else {
        console.log("login.js: credintails matched");
        step2Password(obj, res, req);
      }
    }
  );
}

// Set the session variables and redirect to the landing page
function step2Password(obj, res, req) {
  let sql =
    "SELECT u.user_role_id FROM `user` AS u INNER JOIN `account_number` as `an` ON an.user_id = u.user_id WHERE an.account_number = ?;";
  dbCon.query(sql, [obj.accountNumber], function (err, rows) {
    if (err) {
      throw err;
    }
    obj.role = rows[0].user_role_id;
    console.log("Set userRole to: " + obj.role);

    req.session.loggedIn = true;
    req.session.userRole = obj.role;
    req.session.accountNumber = obj.accountNumber;
    res.redirect("/");
  });
}
module.exports = router;
