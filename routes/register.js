var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("register.js GET");
  res.render("register", {});
});

/* POST home page. */
router.post("/", function (req, res, next) {
  console.log("register.js POST");
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const salt = req.body.salt;
  const hash = req.body.hash;
  const email = req.body.email;
  const userRole = 1;
  let accountNumber;

  const sql = "CALL `banking_system_project`.`create_user`(?, ?, ?, ?, ?, ?, @newAccountNumber, @createError); SELECT @newAccountNumber, @createError;";
  dbCon.query(
    sql, [firstName, lastName, email, hash, salt, userRole, accountNumber], function (err, rows) {
      if (err) {
        throw err;
      }
      if(rows[1][0]['@createError'] == 1){
        res.render("register", {
          message: `The email ${email} enter is already in use`,
        });
      }
      else{
        console.log("The new account number is: " + rows[1][0]['@newAccountNumber']);    

        res.render("registerSuccess", {
          message: "The new account number is: ",
          accountNumber: rows[1][0]['@newAccountNumber']
        });
      }


    });
});

module.exports = router;
