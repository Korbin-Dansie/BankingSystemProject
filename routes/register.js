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
  let obj = new Object();
  obj.firstName = req.body.firstName;
  obj.lastName = req.body.lastName;
  obj.salt = req.body.salt;
  obj.hash = req.body.hash;
  obj.email = req.body.email;
  obj.userRole = 1;
  step1Register(obj, res)
});

// Create a new user - display the new account number - if the email is already in use display an error
function step1Register(obj, res){
  const sql = "CALL `banking_system_project`.`create_user`(?, ?, ?, ?, ?, ?, @newAccountNumber, @createError); SELECT @newAccountNumber, @createError;";
  dbCon.query(
    sql, [obj.firstName, obj.lastName, obj.email, obj.hash, obj.salt, obj.userRole, obj.accountNumber], function (err, rows) {
      if (err) {
        throw err;
      }

      obj.accountNumber = rows[1][0]['@newAccountNumber'];

      if(rows[1][0]['@createError'] == 1){
        res.render("register", {
          message: `The email ${obj.email} enter is already in use`,
        });
      }
      else{
        console.log("The new account number is: " + obj.accountNumber);    

        res.render("registerSuccess", {
          message: "The new account number is: ",
          accountNumber: obj.accountNumber
        });
      }
    });
}

module.exports = router;
