var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('changePassword: GET');
  res.render('changePassword', { });
});

/* POST home page. */
router.post('/', function(req, res, next) {
  console.log('changePassword: POST');

  const accountNumber = req.body.accountNumber;

  //Check if they sumited the updated password
  if(req.body.hash && req.body.salt){
    const hash = req.body.hash;
    const salt = req.body.salt;
    const sql = "CALL change_password(?,?,?);";
    dbCon.query(sql, [accountNumber, hash, salt], function(err, rows){
      if(err){
        throw err;
      }
      
      // Go to landing page
      res.redirect('/');
    })
  }

  else{
  // Check if account exists
  const sql = "CALL check_accountNumber(?);";
  dbCon.query(sql, [accountNumber], function(err,rows){
    if(err){
      throw err;
    }

    console.log(rows[0]);
    // if account does not exist
    if(rows[0][0].result == 0){
      res.render('changePassword', { message: 'Account number: ' + accountNumber + " does not exist."});
    }
    // If account does exist
    else{
      // If it exists display user name
      const sql = 'CALL getAccountName(?);';
      dbCon.query(sql, [accountNumber], function(err, rows){
        if(err){
          throw err;
        }
        console.log(rows[0]);
        const firstName = rows[0][0].firstName;
        const lastName = rows[0][0].lastName;
        // Get their salt
        res.render('changePasswordResult', {accountNumber: accountNumber, lastName: lastName, firstName: firstName});

      })
    }
  });
  }
});

module.exports = router;