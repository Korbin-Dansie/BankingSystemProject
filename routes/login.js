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
  if (req.body.hashedPassword) {
    const accountNumber = req.session.accountNumber;
    const hashedPassword = req.body.hashedPassword;
    const salt = req.body.salt;
    const sql = "CALL check_Credentials(?,?);";
    dbCon.query(sql, [accountNumber, hashedPassword], function (err, rows) {
      if (err) {
        throw err;
      }
      console.log("Loginuser.js obtained password");
      // Credentials did not work
      if (rows[0][0] === undefined || rows[0][0].result == 0) {
        console.log("loginuser.js: No password credintails found");
        data = req.body;
        res.render("loginPassword", {
          message:
            "Password not valid for user " + accountNumber + ". Please log in again",
            accountNumber: accountNumber,
            salt: salt
          });
      }
      // logged in correctly
      else {
        console.log("login.js: credintails matched");
        req.session.loggedIn = true;
                // Nested query - to set userRole
                let sql =
                "SELECT u.user_role_id FROM `user` AS u INNER JOIN `account_number` as `an` ON an.user_id = u.user_id WHERE an.account_number = ?;";
              dbCon.query(sql, [accountNumber], function (err, rows) {
                if (err) {
                  throw err;
                }
                const role = rows[0].user_role_id;
                console.log("Set userRole to: " + role);
                req.session.userRole = role;
                res.redirect("/");
              });
              // End of nested query
      }
    });
  }
  // Not logged in and have a accountNumber
  else if (req.body.accountNumber != "") {
    const accountNumber = req.body.accountNumber;

    let sql = "CALL get_salt(?);";
    dbCon.query(sql, [accountNumber], function (err, rows) {
      if (err) {
        throw err;
      }
      // If accountNumber is not in the database
      if (rows[0][0] === undefined) {
        console.log("login.js No results found");
        res.render("login", {
          message: `accountNumber: "${accountNumber}" not found`,
        });
      } else {
        const salt = rows[0][0].salt;
        req.session.accountNumber = accountNumber;
        req.session.salt = salt; // might not need the salt but keep it their in case

        res.render("loginPassword", {
          accountNumber: accountNumber,
          salt: salt,
        });
      }
    });
  }
});

module.exports = router;
