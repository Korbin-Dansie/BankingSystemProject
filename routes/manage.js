var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("mange.js GET");

  res.render('manage', {});
});


router.post('/', function(req, res, next) {
  console.log("mange.js POST");

  const accountNumber = req.body.accountNumber;
  // check if logged in

  // Check if submited updating uuser permisions
  if(req.body.administration && req.body.accountNumber){
    const administration = req.body.administration;

    const sql = 'CALL setUserRole(?,?);';
    dbCon.query(sql, [accountNumber, administration], function(err,rows){
      if(err){
        throw err;
      }

      res.redirect("/");
    });

  }
  else{
  // Check if account number exists
  const sql = 'CALL check_accountNumber(?);';
  dbCon.query(sql, [accountNumber], function(err,rows){
    if(err){
      throw err;
    }

    console.log(rows[0]);
    // if account does not exist
    if(rows[0][0].result == 0){
      res.render('manage', { message: 'Account number: ' + accountNumber + " does not exist."});
    }
    else{
      const sql = 'CALL getAccountName(?);';
      dbCon.query(sql, [accountNumber], function(err, rows){
        if(err){
          throw err;
        }
        console.log(rows[0]);
        const firstName = rows[0][0].firstName;
        const lastName = rows[0][0].lastName;
        
        const sql = 'CALL getUserRole(?);';
        dbCon.query(sql, [accountNumber], function(err, rows){
          if(err){
            throw err;
          }
          console.log(rows[0]);
          const userRole = rows[0][0].user_type;
          res.render('manageResults', {accountNumber: accountNumber, lastName: lastName, firstName: firstName, userRole: userRole});

        });

        // Get their salt
      });
    }
  });
  }
});
module.exports = router;