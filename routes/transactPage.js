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
  } else {
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

      // Get user fist and last name
      const sql = "SELECT u.user_first_name as firstName, u.user_last_name as lastName \n" +
      "FROM `user` as u \n" +
      "INNER JOIN `account_number` AS an ON an.user_id = u.user_id \n" +
      "WHERE an.account_number = ?;";
      dbCon.query(sql, [accountNumber], function(err, rows){
        if(err){
          throw err;
        }
        console.log(rows[0]);
        const firstName = rows[0].firstName;
        const lastName = rows[0].lastName;

        res.render("transactPageResults", {
          checkingAccount: checkingAccountBalance,
          savingAccount: savingAccountBalance,
          firstName: firstName,
          lastName: lastName,
        });
      });

    });
  }
});

module.exports = router;
