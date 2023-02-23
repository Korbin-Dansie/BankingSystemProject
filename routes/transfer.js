var express = require("express");
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    res.render("transfer", {});
  }
});

/* GET home page. */
router.post("/", function (req, res, next) {
  if (!req.session.loggedIn || req.session.loggedIn == false) {
    res.redirect("/");
  } else {
    const fromAccountType = req.body.fromAccount || 0;
    const toAccountNumber = req.body.toAccount || 0;
    const toAccountType = req.body.toAccountType || 0;
    const amount = req.body.amount || 0;
    const memo = req.body.memo;

    // If feilds are empty do not accept query
    const sql = "CALL `user_transfer`(?,?,?,?,?,?,@result); select @result;";
    dbCon.query(
      sql,
      [
        req.session.accountNumber,
        fromAccountType,
        toAccountNumber,
        toAccountType,
        amount,
        memo
      ],
      function (err, rows) {
        if (err) {
          throw err;
        }

        // See if transaction is good
        console.log('Transaction Result: 1=Good, 0=Bad'); 
        console.log(rows[1][0]['@result']); 
        const result = rows[1][0]['@result'];
        if(result){
          const icon = "<i class=\"pull-right text-success bi bi-check-circle-fill \"></i>";
          res.render("transfer", { message: icon +  " Transaction Successful" });
        }
        // If transaction is not good display an error
        else{
          const icon = "<i class=\"pull-right text-danger bi bi-x-circle-fill \"></i>";
          res.render("transfer", { message: icon + " There was an error with the transaction" });
        }

      }
    );
  }
});

module.exports = router;
