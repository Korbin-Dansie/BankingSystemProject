var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('transactionHistory', { 
    transactionHistory: [
      {
        "historyid" : 1,
        "bankAccountNumberFrom" : null,
        "bankAccountNumberFromSufix" : null,
        "bankAccountNumberTo" : "498077",
        "bankAccountNumberToSufix" : 1,
        "amount" : 3264781.69,
        "memo" : "Deposit lots of money into Checking",
        "transactionDate" : "2023-01-01 10:00:15"
      },
      {
        "historyid" : 2,
        "bankAccountNumberFrom" : null,
        "bankAccountNumberFromSufix" : null,
        "bankAccountNumberTo" : "498077",
        "bankAccountNumberToSufix" : 2,
        "amount" : 100000.69,
        "memo" : "Deposit lots of money into saving",
        "transactionDate" : "2023-01-01 7:00:17"
      },
      {
        "historyid" : 3,
        "bankAccountNumberFrom" : "713639",
        "bankAccountNumberFromSufix" : 1,
        "bankAccountNumberTo" : "498077",
        "bankAccountNumberToSufix" : 1,
        "amount" : 111.13,
        "memo" : null,
        "transactionDate" : "2023-01-20 8:02:50"
      },
      {
        "historyid" : 4,
        "bankAccountNumberFrom" : "441843",
        "bankAccountNumberFromSufix" : 1,
        "bankAccountNumberTo" : "498077",
        "bankAccountNumberToSufix" : 1,
        "amount" : 100.00,
        "memo" : null,
        "transactionDate" : "2023-01-25 15:39:59"
      },
      {
        "historyid" : 5,
        "bankAccountNumberFrom" : "273122",
        "bankAccountNumberFromSufix" : 1,
        "bankAccountNumberTo" : "498077",
        "bankAccountNumberToSufix" : 1,
        "amount" : 10.69,
        "memo" : null,
        "transactionDate" : "2023-01-27 01:46:32"
      }
    ]    
  });
});

module.exports = router;