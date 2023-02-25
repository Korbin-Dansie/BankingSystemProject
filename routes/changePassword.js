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

  let obj = new Object();
  obj.accountNumber = req.body.accountNumber;

  //Check if they submited the updated password
  if(req.body.hash && req.body.salt){
    obj.hash = req.body.hash;
    obj.salt = req.body.salt;
    changePassword(obj, res);
  }
  // Check if they are looking for the account number
  else{
    // From changePassword.ejs - To changePasswordResult.ejs
    step1ChangePassword(obj, res);
  }
});

// Have all the information so update the password
function changePassword(obj, res){
  const sql = "CALL change_password(?,?,?);";
  dbCon.query(sql, [obj.accountNumber, obj.hash, obj.salt], function(err, rows){
    if(err){
      throw err;
    }
    // Go to landing page
    res.redirect('/');
  });
}

// See if account number exists
function step1ChangePassword(obj, res){
  // Check if account exists
  const sql = "CALL check_accountNumber(?);";
  dbCon.query(sql, [obj.accountNumber], function(err,rows){
    if(err){
      throw err;
    }

    console.log(rows[0]);
    console.log(obj);
    // if account does not exist
    if(rows[0][0].result == 0){
      res.render('changePassword', { message: 'Account number: ' + obj.accountNumber + " does not exist."});
    }
    // If account does exist
    else{
      step2ChangePassword(obj, res);
    }
  });
}

// If the account exists gets the name to display on the result page
function step2ChangePassword(obj, res){
      // If it exists display user name
      const sql = 'CALL getAccountName(?);';
      dbCon.query(sql, [obj.accountNumber], function(err, rows){
        if(err){
          throw err;
        }
        console.log(rows[0]);
        obj.firstName = rows[0][0].firstName;
        obj.lastName = rows[0][0].lastName;
        // Get their salt
        res.render('changePasswordResult', {accountNumber: obj.accountNumber, lastName: obj.lastName, firstName: obj.firstName});
      });
}

module.exports = router;