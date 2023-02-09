let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true // Needed for stored proecures with OUT results
});

con.connect(function (err) {
  if (err) {
    throw err;
  } else {
    console.log("database.js: Connected to server!");

    //TODO: delete after testing. Drop database when ran
    con.query("DROP DATABASE IF EXISTS banking_system_project");


    con.query("CREATE DATABASE IF NOT EXISTS banking_system_project", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: banking_system_project database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
  let sql = "USE banking_system_project";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Selected banking_system_project database\n\n");
      createTables();
      createStoredProcedures();
      addTableData();
    }
  });
}


function createTables() {
  // A CREATE TABLE call will work if it does not exist or if it does exist.

  let sql = "CREATE TABLE IF NOT EXISTS `user_type` (\n" +
  "  `user_type_id` TINYINT NOT NULL AUTO_INCREMENT,\n" +
  "  `user_type` VARCHAR(25) NOT NULL,\n" +
  "  PRIMARY KEY (`user_type_id`)\n" +
  ") COMMENT = 'customer, employee, admin';";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table user_type created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS `user` (\n" +
  "  `user_id` int NOT NULL AUTO_INCREMENT,\n" +
  "  `user_first_name` varchar(50) NOT NULL,\n" +
  "  `user_last_name` varchar(50) NOT NULL,\n" +
  "  `hashed_password` varchar(255) NOT NULL,\n" +
  "  `salt` varchar(255) NOT NULL,\n" +
  "  `user_role_id` TINYINT NOT NULL,\n" +
  "  PRIMARY KEY (`user_id`),\n" +
  "  KEY `user_type_id` (`user_role_id`),\n" +
  "  CONSTRAINT `user_type_id` FOREIGN KEY (`user_role_id`) REFERENCES `user_type` (`user_type_id`) ON UPDATE CASCADE\n" +
  ") COMMENT = 'This is for all the customers, employees, and admins.';";

  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table user created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS `account_number` (\n" +
  "  `account_number` int NOT NULL AUTO_INCREMENT,\n" +
  "  `user_id` int NOT NULL,\n" +
  "  PRIMARY KEY (`account_number`),\n" +
  "  KEY `user_id_idx` (`user_id`),\n" +
  "  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE\n" +
  ") AUTO_INCREMENT = 111111 COMMENT = 'For storing the users account number';";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table account_number created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS `account_type` (\n" +
  "  `account_type_id` tinyint NOT NULL AUTO_INCREMENT,\n" +
  "  `account_type` varchar(25) NOT NULL,\n" +
  "  PRIMARY KEY (`account_type_id`)\n" +
  ") COMMENT = 'checking, savings';";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table account_type created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS `account` (\n" +
  "  `account_id` int NOT NULL AUTO_INCREMENT,\n" +
  "  `account_number` int NOT NULL,\n" +
  "  `account_type_id` tinyint NOT NULL,\n" +
  "  PRIMARY KEY (`account_id`),\n" +
  "  KEY `account_number` (`account_number`),\n" +
  "  CONSTRAINT `account_number` FOREIGN KEY (`account_number`) REFERENCES `account_number` (`account_number`) ON DELETE CASCADE ON UPDATE CASCADE,\n" +
  "  KEY `account_type_id` (`account_type_id`),\n" +
  "  CONSTRAINT `account_type_id` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`account_type_id`) ON UPDATE CASCADE\n" +
  ") COMMENT = 'Each user has should have two accounts.\nI thought about creating a table to store just the account number (so I dont store duplicate information) but I thought it was a bit too complicated for this school assignment.';";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table account created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS `transaction` (\n" +
  "  `transaction_id` int NOT NULL AUTO_INCREMENT,\n" +
  "  `from_account_id` int DEFAULT NULL,\n" +
  "  `to_account_id` int DEFAULT NULL,\n" +
  "  `transaction_amount` decimal(10, 2) NOT NULL,\n" +
  "  `memo` varchar(255) DEFAULT NULL,\n" +
  "  `transaction_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,\n" +
  "  PRIMARY KEY (`transaction_id`),\n" +
  "  KEY `account_id_idx` (`from_account_id`, `to_account_id`),\n" +
  "  CONSTRAINT `account_id` FOREIGN KEY (`from_account_id`) REFERENCES `account` (`account_id`) ON UPDATE CASCADE\n" +
  ") COMMENT = 'From	+ NULL = Widthdraw\nTo	+ NULL = Deposit';";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table transaction created if it didn't exist");
    }
  });
} // end of createTables()

function createStoredProcedures() {
  let sql = "CREATE PROCEDURE IF NOT EXISTS `insert_account_type`(IN account_type_name VARCHAR(25)) BEGIN\n" +
  "INSERT INTO account_type(account_type)\n" +
  "SELECT account_type_name\n" +
  "FROM DUAL\n" +
  "WHERE NOT EXISTS (\n" +
  "    SELECT *\n" +
  "    FROM `account_type`\n" +
  "    WHERE account_type.account_type = account_type_name\n" +
  "    LIMIT 1\n" +
  "  );\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP insert_account_type created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(IN user_type_name VARCHAR(25)) BEGIN\n" +
  "INSERT INTO user_type(user_type)\n" +
  "SELECT user_type_name\n" +
  "FROM DUAL\n" +
  "WHERE NOT EXISTS (\n" +
  "    SELECT *\n" +
  "    FROM `user_type`\n" +
  "    WHERE user_type.user_type = user_type_name\n" +
  "    LIMIT 1\n" +
  "  );\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP insert_user_type created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `create_user`(\n" +
  "  IN firstName VARCHAR(50),\n" +
  "  IN lastName VARCHAR(50),\n" +
  "  IN hashed_password VARCHAR(255),\n" +
  "  IN salt VARCHAR(255),\n" +
  "  IN user_role_id TINYINT,\n" +
  "  OUT accountNumber int\n" +
  ") \n" +
  "BEGIN -- Create User account\n" +
  "INSERT INTO `user` (\n" +
  "    `user_first_name`,\n" +
  "    `user_last_name`,\n" +
  "    `hashed_password`,\n" +
  "    `salt`,\n" +
  "    `user_role_id`\n" +
  "  )\n" +
  "VALUES (\n" +
  "    firstName,\n" +
  "    lastName,\n" +
  "    hashed_password,\n" +
  "    salt,\n" +
  "    user_role_id\n" +
  "  );\n" +
  "-- Generate bankaccount number\n" +
  "SET @newAccountNumber = 0;\n" +
  "CALL create_account_number(LAST_INSERT_ID(), @newAccountNumber);\n" +
  "-- Create Two bank accounts\n" +
  "CALL create_account(@newAccountNumber, 1);\n" +
  "CALL create_account(@newAccountNumber, 2);\n" +
  "SELECT @newAccountNumber INTO accountNumber;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP create_user created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `change_user_type`(IN accountNumber INT, IN userType VARCHAR(255)) BEGIN\n" +
  "UPDATE `user` as u\n" +
  "  INNER JOIN account_number as an ON an.user_id = u.user_id\n" +
  "SET user_role_id = (\n" +
  "    SELECT user_type_id\n" +
  "    FROM user_type\n" +
  "    where user_type = userType\n" +
  "  )\n" +
  "WHERE an.account_number = accountNumber\n" +
  "LIMIT 1;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP change_user_type created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `create_account`(\n" +
  "  IN accountNumber int,\n" +
  "  IN accountType tinyint\n" +
  ") BEGIN\n" +
  "INSERT INTO `account` (`account_number`, `account_type_id`)\n" +
  "VALUES (accountNumber, accountType);\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP create_account created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `create_account_number`(IN user_id int, OUT accountNumber int) BEGIN\n" +
  "INSERT INTO `account_number` (`user_id`)\n" +
  "VALUES (user_id);\n" +
  "SELECT LAST_INSERT_ID() INTO accountNumber;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP create_account_number created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `getAccountID`(\n" +
  "  IN account_number INT,\n" +
  "  IN account_type TINYINT,\n" +
  "  OUT account_ID INT\n" +
  ") BEGIN\n" +
  "SELECT a.account_id\n" +
  "FROM `account` AS a\n" +
  "WHERE a.account_number = account_number\n" +
  "  AND a.account_type_id = account_type INTO account_ID;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP getAccountID created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_balance`(\n" +
  "  IN accountNumber INT,\n" +
  "  IN accountType TINYINT,\n" +
  "  OUT balance DECIMAL(10, 2)\n" +
  ") BEGIN\n" +
  "DECLARE accountID INT DEFAULT 0;\n" +
  "DECLARE deposits DECIMAL(10, 2) DEFAULT 20;\n" +
  "DECLARE withdraws DECIMAL(10, 2) DEFAULT 1;\n" +
  "CALL `getAccountID`(accountNumber, accountType, accountID);\n" +
  "CALL `get_balance_by_account_id`(accountID, balance);\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_balance created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_balance_by_account_id`(\n" +
  "  IN accountID INT,\n" +
  "  OUT balance DECIMAL(10, 2)\n" +
  ") BEGIN\n" +
  "DECLARE deposits DECIMAL(10, 2) DEFAULT 0;\n" +
  "DECLARE withdraws DECIMAL(10, 2) DEFAULT 0;\n" +
  "SELECT SUM(tt.transaction_amount)\n" +
  "FROM `transaction` AS tt\n" +
  "WHERE tt.to_account_id = accountID INTO deposits;\n" +
  "SELECT SUM(ft.transaction_amount)\n" +
  "FROM `transaction` AS ft\n" +
  "WHERE ft.from_account_id = accountID INTO withdraws;\n" +
  "IF deposits IS NULL THEN\n" +
  "SET deposits = 0;\n" +
  "END IF;\n" +
  "IF withdraws IS NULL THEN\n" +
  "SET withdraws = 0;\n" +
  "END IF;\n" +
  "-- Withdraws need to be negitive\n" +
  "SELECT deposits - withdraws INTO balance;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_balance_by_account_id created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_account_balance`(IN accountNumber INT) BEGIN\n" +
  "DECLARE amount DECIMAL(10, 2) DEFAULT 0;\n" +
  "DECLARE finished INTEGER DEFAULT 0;\n" +
  "DECLARE _id INT;\n" +
  "-- Store account.account_id\n" +
  "DECLARE _typeid TINYINT;\n" +
  "-- Store account.account_type_id\n" +
  "DECLARE cur_balance CURSOR FOR\n" +
  "SELECT a.account_id,\n" +
  "  a.account_type_id\n" +
  "FROM `account` AS a\n" +
  "WHERE a.account_number = accountNumber;\n" +
  "DECLARE CONTINUE HANDLER FOR NOT FOUND\n" +
  "SET finished = 1;\n" +
  "-- Create temp table\n" +
  "DROP TEMPORARY TABLE IF EXISTS balance_table;\n" +
  "CREATE TEMPORARY TABLE balance_table(account_type TINYINT, balance DECIMAL(10, 2));\n" +
  "-- Loop through each sub-account\n" +
  "OPEN cur_balance;\n" +
  "getBalance: LOOP FETCH cur_balance INTO _id,\n" +
  "_typeid;\n" +
  "IF finished = 1 THEN LEAVE getBalance;\n" +
  "END IF;\n" +
  "-- Call balance and insert it into current row\n" +
  "CALL `banking_system_project`.`get_balance_by_account_id`(_id, amount);\n" +
  "INSERT INTO balance_table(account_type, balance)\n" +
  "VALUES (_typeid, amount);\n" +
  "END LOOP getBalance;\n" +
  "CLOSE cur_balance;\n" +
  "-- Insert the balance of sub account into temp table\n" +
  "SELECT *\n" +
  "FROM balance_table;\n" +
  "DROP TEMPORARY TABLE balance_table;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_account_balance created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `transfer`(\n" +
  "  IN fromAccountNumber INT,\n" +
  "  IN fromAccountType TINYINT,\n" +
  "  IN toAccountNumber INT,\n" +
  "  IN toAccountType TINYINT,\n" +
  "  IN amount DECIMAL(10, 2),\n" +
  "  IN memo VARCHAR(255),\n" +
  "  OUT result TINYINT\n" +
  ") BEGIN\n" +
  "DECLARE fromAccountId INT;\n" +
  "DECLARE toAccountId INT;\n" +
  "DECLARE balance DECIMAL(10, 2);\n" +
  "CALL `getAccountID`(\n" +
  "  fromAccountNumber,\n" +
  "  fromAccountType,\n" +
  "  fromAccountId\n" +
  ");\n" +
  "CALL `getAccountID`(toAccountNumber, toAccountType, toAccountId);\n" +
  "-- Check the balance of the from account\n" +
  "CALL `get_balance_by_account_id`(fromAccountId, balance);\n" +
  "-- If amount is greater than from account balance return 0. If there is no from account then its a deposit\n" +
  "-- or trying to tranfer money to the same account\n" +
  "IF (\n" +
  "  (\n" +
  "    (amount > balance)\n" +
  "    AND (fromAccountId IS NOT NULL)\n" +
  "  )\n" +
  "  OR fromAccountId = toAccountId\n" +
  ") THEN\n" +
  "SELECT 0 INTO result;\n" +
  "ELSE -- Transfer the money\n" +
  "INSERT INTO `transaction` (\n" +
  "    `from_account_id`,\n" +
  "    `to_account_id`,\n" +
  "    `transaction_amount`,\n" +
  "    `memo`\n" +
  "  )\n" +
  "VALUES (\n" +
  "    fromAccountId,\n" +
  "    toAccountId,\n" +
  "    amount,\n" +
  "    memo\n" +
  "  );\n" +
  "SELECT 1 INTO result;\n" +
  "END IF;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP transfer created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `deposit`(\n" +
  "  IN toAccountNumber INT,\n" +
  "  IN toAccountType TINYINT,\n" +
  "  IN amount DECIMAL(10, 2),\n" +
  "  IN memo VARCHAR(255),\n" +
  "  OUT result TINYINT\n" +
  ") BEGIN CALL `banking_system_project`.`transfer`(\n" +
  "  NULL,\n" +
  "  NULL,\n" +
  "  toAccountNumber,\n" +
  "  toAccountType,\n" +
  "  amount,\n" +
  "  memo,\n" +
  "  result\n" +
  ");\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP deposit created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `withdraw`(\n" +
  "  IN fromAccountNumber INT,\n" +
  "  IN fromAccountType TINYINT,\n" +
  "  IN amount DECIMAL(10, 2),\n" +
  "  IN memo VARCHAR(255),\n" +
  "  OUT result TINYINT\n" +
  ") BEGIN CALL `banking_system_project`.`transfer`(\n" +
  "  fromAccountNumber,\n" +
  "  fromAccountType,\n" +
  "  NULL,\n" +
  "  NULL,\n" +
  "  amount,\n" +
  "  memo,\n" +
  "  result\n" +
  ");\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP withdraw created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_transaction_history`(\n" +
  "  IN accountNumber INT,\n" +
  "  IN accountType TINYINT\n" +
  ") BEGIN\n" +
  "SELECT a.account_type_id,\n" +
  "  -- Determines if the amount is a deposit (1) or withdraw (0)\n" +
  "  CASE\n" +
  "    WHEN a.account_id = t.to_account_id THEN 1\n" +
  "    ELSE 0\n" +
  "  END AS 'isDeposit',\n" +
  "  t.transaction_amount,\n" +
  "  t.memo,\n" +
  "  t.transaction_time\n" +
  "FROM account_number AS an\n" +
  "  INNER JOIN `account` as a ON a.account_number = an.account_number\n" +
  "  INNER JOIN `transaction` as t ON (\n" +
  "    (t.from_account_id = a.account_id)\n" +
  "    OR (t.to_account_id = a.account_id)\n" +
  "  )\n" +
  "WHERE an.account_number = accountNumber\n" +
  "  AND a.account_type_id = accountType;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_transaction_history created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_account_transaction_history`(IN accountNumber INT) BEGIN\n" +
  "SELECT a.account_type_id,\n" +
  "  -- Determines if the amount is a deposit (1) or withdraw (0)\n" +
  "  CASE\n" +
  "    WHEN a.account_id = t.to_account_id THEN 1\n" +
  "    ELSE 0\n" +
  "  END AS 'isDeposit',\n" +
  "  t.transaction_amount,\n" +
  "  t.memo,\n" +
  "  t.transaction_time\n" +
  "FROM account_number AS an\n" +
  "  INNER JOIN `account` as a ON a.account_number = an.account_number\n" +
  "  INNER JOIN `transaction` as t ON (\n" +
  "    (t.from_account_id = a.account_id)\n" +
  "    OR (t.to_account_id = a.account_id)\n" +
  "  )\n" +
  "WHERE an.account_number = accountNumber;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_account_transaction_history created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
  "  IN accountNumber INT,\n" +
  "  IN hashed_password VARCHAR(255)\n" +
  ") BEGIN\n" +
  "SELECT EXISTS(\n" +
  "    SELECT *\n" +
  "    FROM `user` AS u\n" +
  "      INNER JOIN `account_number` AS an ON u.user_id = an.user_id\n" +
  "    WHERE an.account_number = accountNumber\n" +
  "      AND u.hashed_password = hashed_password\n" +
  "  ) AS result;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP check_credentials created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_salt`(IN accountNumber INT) BEGIN\n" +
  "SELECT u.salt\n" +
  "FROM `user` AS u\n" +
  "  INNER JOIN account_number AS an ON u.user_id = an.user_id\n" +
  "WHERE an.account_number = accountNumber;\n" +
  "END ";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_salt created if it didn't exist");
    }
  });



  
} // end of createStoredProcedures()

function addTableData() {

  let accountNumber1 = 111111, accountNumber2 = 111112, accountNumber3 = 111113; 

  let sql = "CALL `banking_system_project`.`insert_user_type`('customer');";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL added 'customer' to user_type");
  });

  sql = "CALL `banking_system_project`.`insert_user_type`('employee');";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL added 'employee' to user_type");
  });
  
  sql = "CALL `banking_system_project`.`insert_user_type`('admin');";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL added 'admin' to user_type");
  });
  
  sql = "CALL `banking_system_project`.`insert_account_type`('checkings');";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL added 'checkings' to account_type");
  });
  
  sql = "CALL `banking_system_project`.`insert_account_type`('savings');";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL Added 'savings' to account_type");
  });
  
  sql = "CALL `create_user`\n" +
  "('Korbin',\n" +
  " 'Dansie',\n" +
  " 'MySuperSecurePassword',\n" +
  " 'MySuperSecureSalt',\n" +
  " 1,\n" +
  " @accountNumber); select @accountNumber as 'newAccountNumber'";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL create user 'Korbin Dansie'");
    accountNumber1 = rows[1][0].newAccountNumber;
  });

  sql = "  CALL `create_user`\n" +
  "('Briella',\n" +
  " 'Rutherford',\n" +
  " 'FinalTestPersonPassword',\n" +
  " 'FinalTestSalt',\n" +
  " 1,\n" +
  " @accountNumber); select @accountNumber as 'newAccountNumber'";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL create user 'Briella Rutherford'");
    accountNumber2 = rows[1][0].newAccountNumber;
  });

  sql = " CALL `create_user`\n" +
  "('Bradley',\n" +
  " 'Peterson',\n" +
  " 'SomeOtherPassword',\n" +
  " 'SomeOtherSalt',\n" +
  " 1,\n" +
  " @accountNumber); select @accountNumber as 'newAccountNumber'";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL create user 'Bradley Peterson'");
    accountNumber3 = rows[1][0].newAccountNumber;
  });

  sql = "CALL `change_user_type`(?, 'admin');";
  con.query(sql, [accountNumber1], function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL set 'Korbin' to admin");
  });

  sql = "CALL `change_user_type`(?, 'employee');";
  con.query(sql, [accountNumber2], function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL set 'Briella Rutherford' to employee");
  });

  /***************************************************************
  * test transfer
  ***************************************************************/
 sql = "CALL `deposit`(?, 1, 200, 'A deposit', @TransferSuccess);";
  con.query(sql, [accountNumber1], function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL deposit 200 dollars");
  });

  sql = "CALL `transfer`(?, 1, ?, 2, 9.99, 'A transfer', @TransferSuccess);";
  con.query(sql, [accountNumber1, accountNumber1], function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL transfer 9.99");
  });

  sql = "CALL `withdraw`(?, 1, 90.01, 'A withdraw', @TransferSuccess);";
  con.query(sql, [accountNumber1], function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL withdraw 90.01");
  });

  sql = "CALL `transfer`(?, 1, ?, 2, 1.00, 'Take a dollar', @TransferSuccess);";
  con.query(sql, [accountNumber1, accountNumber2], function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL transfer a dollar into another users account");
  });

  sql = "CALL `get_account_transaction_history`(?);";
  con.query(sql, [accountNumber1], function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    
    console.log(rows);

    var keys = Object.keys( rows[1] );
    for( var i = 0, length = keys.length; i < length; i++ ) {
        console.log(keys[i].valueOf())
    }

    console.log("database.js: CALL show transaction history of the first account");
  });
} // end of addTableData()

module.exports = con;