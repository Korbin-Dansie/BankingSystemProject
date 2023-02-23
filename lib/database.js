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
    //con.query("DROP DATABASE IF EXISTS banking_system_project");


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
      createTriggers();
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
  "  `amount` decimal(10,2) DEFAULT '0.00',\n" +
  "  PRIMARY KEY (`account_id`),\n" +
  "  KEY `account_number` (`account_number`),\n" +
  "  KEY `account_type_id` (`account_type_id`),\n" +
  "  CONSTRAINT `account_number` FOREIGN KEY (`account_number`) REFERENCES `account_number` (`account_number`) ON DELETE CASCADE ON UPDATE CASCADE,\n" +
  "  CONSTRAINT `account_type_id` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`account_type_id`) ON UPDATE CASCADE\n" +
  ") COMMENT='Each user has should have two accounts a checking (1) and saving (2). The amount is calculated by a triggers in the transaction tables.';";
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
  ") COMMENT = 'From	+ NULL = Widthdraw. To	+ NULL = Deposit. Has triggers on update/insert/delete to update account.amount when rows are added/edited/deleted. Although only adding rows should be needed.';";
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
  "  IN firstName			VARCHAR(50),\n" +
  "  IN lastName			VARCHAR(50),\n" +
  "  IN email				VARCHAR(50),\n" +
  "  IN hashed_password 	VARCHAR(255),\n" +
  "  IN salt				VARCHAR(255),\n" +
  "  IN user_role_id 		TINYINT,\n" +
  "  OUT accountNumber 	INT,\n" +
  "  OUT result			INT\n" +
  ") \n" +
  "BEGIN -- Create User account\n" +
  " DECLARE nCount INT DEFAULT 0;\n" +
  " SET result = 0;\n" +
  " SELECT Count(*) INTO nCount FROM `user` as u WHERE u.email = email;\n" +
  " IF nCount > 0 THEN\n" +
  "	SET result = 1;\n" +
  " ELSE \n" +
  " 	SET result = 0;\n" +
  "	INSERT INTO `user` (\n" +
  "		`user_first_name`,\n" +
  "		`user_last_name`,\n" +
  "		`email`,\n" +
  "		`hashed_password`,\n" +
  "		`salt`,\n" +
  "		`user_role_id`\n" +
  "	)\n" +
  "	VALUES (\n" +
  "		firstName,\n" +
  "		lastName,\n" +
  "		email,\n" +
  "		hashed_password,\n" +
  "		salt,\n" +
  "		user_role_id\n" +
  "	);\n" +
  "	-- Generate bankaccount number\n" +
  "	SET @newAccountNumber = 0;\n" +
  "	CALL create_account_number(LAST_INSERT_ID(), @newAccountNumber);\n" +
  "	-- Create Two bank accounts\n" +
  "	CALL create_account(@newAccountNumber, 1);\n" +
  "	CALL create_account(@newAccountNumber, 2);\n" +
  "	SELECT @newAccountNumber INTO accountNumber;\n" +
  "	END IF;\n" +
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

  sql = "CREATE PROCEDURE IF NOT EXISTS `getAccountName`(\n" +
  "  IN account_number INT\n" +
  ") BEGIN\n" +
  "SELECT u.user_first_name AS firstName, u.user_last_name AS lastName\n" +
  "FROM `user` AS u\n" +
  "INNER JOIN account_number AS an ON an.user_id = u.user_id\n" +
  "WHERE an.account_number = account_number;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP getAccountName created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_balance`(\n" +
  "  IN accountNumber INT,\n" +
  "  IN accountType TINYINT,\n" +
  "  OUT balance DECIMAL(10, 2)\n" +
  ") BEGIN\n" +
  "DECLARE accountID INT DEFAULT 0;\n" +
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
  ") \n" +
  "BEGIN\n" +
  "	SELECT a.amount FROM `account` as a\n" +
  "	WHERE a.account_id = accountID\n" +
  "	INTO balance;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_balance_by_account_id created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_account_balance`(IN accountNumber INT) \n" +
  "BEGIN\n" +
  "	SELECT a.account_type_id as `account_type`, a.amount as `balance`\n" +
  "    FROM\n" +
  "    `account` as a\n" +
  "    WHERE a.account_number = accountNumber;\n" +
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

  sql = "CREATE PROCEDURE IF NOT EXISTS `user_transfer`(\n" +
  "  IN fromAccountNumber INT,\n" +
  "  IN fromAccountType TINYINT,\n" +
  "  IN toAccountNumber INT,\n" +
  "  IN toAccountType TINYINT,\n" +
  "  IN amount DECIMAL(10, 2),\n" +
  "  IN memo VARCHAR(255),\n" +
  "  OUT result TINYINT)\n" +
  "BEGIN\n" +
  "	DECLARE fromAccountId INT DEFAULT 0;\n" +
  "    DECLARE toAccountId	INT DEFAULT 0;\n" +
  "    \n" +
  "	-- Make sure fromAccount exists\n" +
  "    CALL `banking_system_project`.`getAccountID`(\n" +
  "    fromAccountNumber,\n" +
  "    fromAccountType,\n" +
  "    fromAccountId\n" +
  "    );\n" +
  "\n" +
  "    -- Make sure toAccount exists\n" +
  "	CALL `banking_system_project`.`getAccountID`(\n" +
  "    toAccountNumber,\n" +
  "    toAccountType,\n" +
  "    toAccountId\n" +
  "    );\n" +
  "    \n" +
  "    IF(fromAccountId IS NULL OR toAccountId IS NULL) THEN\n" +
  "    SET result = 0;\n" +
  "    ELSE \n" +
  "    CALL `banking_system_project`.`transfer`(\n" +
  "    fromAccountNumber,\n" +
  "    fromAccountType,\n" +
  "    toAccountNumber,\n" +
  "    toAccountType,\n" +
  "	amount,\n" +
  "    memo,\n" +
  "    result\n" +
  "    );\n" +
  "    END IF;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP user_transfer created if it didn't exist");
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
  "  AND a.account_type_id = accountType\n" +
  "ORDER BY t.transaction_id DESC;\n" +
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
  "WHERE an.account_number = accountNumber\n" +
  "ORDER BY t.transaction_id DESC;\n" +
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

  sql = "CREATE PROCEDURE IF NOT EXISTS `check_accountNumber`(IN accountNumber INT)\n" +
  "BEGIN\n" +
  "SELECT EXISTS(\n" +
  "    SELECT *\n" +
  "    FROM `user` AS u\n" +
  "      INNER JOIN `account_number` AS an ON u.user_id = an.user_id\n" +
  "    WHERE an.account_number = accountNumber\n" +
  "  ) AS result;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP check_accountNumber created if it didn't exist");
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

  sql = "CREATE PROCEDURE IF NOT EXISTS `change_password`(IN accountNumber INT, IN hashed_password VARCHAR(255), IN salt VARCHAR(255)) \n" +
  "BEGIN\n" +
  "	UPDATE `user` AS u\n" +
  "    INNER JOIN `account_number` AS an ON an.user_id = u.user_id\n" +
  "    SET u.hashed_password = hashed_password, u.salt = salt\n" +
  "    WHERE an.account_number = accountNumber\n" +
  "    LIMIT 1;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP change_password created if it didn't exist");
    }
  });
  
} // end of createStoredProcedures()

function createTriggers(){
  let sql = "CREATE TRIGGER IF NOT EXISTS `trigger_add_new_transaction` \n" +
  "AFTER INSERT\n" +
  "ON `transaction` FOR EACH ROW\n" +
  "BEGIN\n" +
  "	-- Add to the to account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount + NEW.transaction_amount\n" +
  "    WHERE a.account_id = NEW.to_account_id;\n" +
  "    \n" +
  "    -- Sub from the from account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount - NEW.transaction_amount\n" +
  "    WHERE a.account_id = NEW.from_account_id;\n" +
  "END ";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Trigger created trigger_add_new_transaction");
    }
  });

  sql = "CREATE TRIGGER IF NOT EXISTS `trigger_update_new_transaction`\n" +
  "BEFORE UPDATE\n" +
  "ON `transaction` FOR EACH ROW\n" +
  "BEGIN \n" +
  "	-- Might add this to only trigger on change of to/from account, OR amount \n" +
  "    -- https://stackoverflow.com/questions/4097949/mysql-trigger-question-only-trigger-when-a-column-is-changed\n" +
  "	-- Add the orignal amount back to the original from_account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount + OLD.transaction_amount\n" +
  "    WHERE a.account_id = OLD.from_account_id;\n" +
  "    \n" +
  "    -- Subtract the orignal amount from the original to_account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount - OLD.transaction_amount\n" +
  "    WHERE a.account_id = OLD.to_account_id;\n" +
  "    \n" +
  "    -- Subtract the new amount from the new from_account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount - NEW.transaction_amount\n" +
  "    WHERE a.account_id = NEW.from_account_id;\n" +
  "    \n" +
  "	-- Add the new amount from the new to_account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount + NEW.transaction_amount\n" +
  "    WHERE a.account_id = NEW.to_account_id;\n" +
  "END ";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Trigger created trigger_update_new_transaction");
    }
  });

  sql = "CREATE TRIGGER IF NOT EXISTS `trigger_delete_new_transaction`\n" +
  "BEFORE DELETE\n" +
  "ON `transaction` FOR EACH ROW\n" +
  "BEGIN \n" +
  "	-- Add the orignal amount back to the original from_account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount + OLD.transaction_amount\n" +
  "    WHERE a.account_id = OLD.from_account_id;\n" +
  "    \n" +
  "    -- Subtract the orignal amount from the original to_account\n" +
  "	UPDATE `account` AS `a`\n" +
  "    SET \n" +
  "    a.amount = a.amount - OLD.transaction_amount\n" +
  "    WHERE a.account_id = OLD.to_account_id;\n" +
  "END";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Trigger created trigger_delete_new_transaction");
    }
  });

}// end of createTriggers()

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
  
  // Password is "1"
  sql = "CALL `create_user`\n" +
  "('Korbin',\n" +
  " 'Dansie',\n" +
  " 'kd@email.com',\n" +
  " '629221b4647a6cabe93c7d4626e7e32e3502a515efe3f5abe1138d16424c40d4',\n" +
  " 'ee730fd0992bc435',\n" +
  " 1,\n" +
  " @accountNumber, @createSuccess); select @accountNumber as 'newAccountNumber'";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL create user 'Korbin Dansie'");
    accountNumber1 = rows[1][0].newAccountNumber;
  });

  // Password is "a"
  sql = "  CALL `create_user`\n" +
  "('Briella',\n" +
  " 'Rutherford',\n" +
  " 'br@email.com',\n" +
  " '32ab5e8361f567498d72b7d921e343f281b6fd05f854517cbc6c59f9842127fe',\n" +
  " '0f6facddd543743b',\n" +
  " 1,\n" +
  " @accountNumber, @createSuccess); select @accountNumber as 'newAccountNumber'";
  con.query(sql, function(err,rows){
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: CALL create user 'Briella Rutherford'");
    accountNumber2 = rows[1][0].newAccountNumber;
  });

  //Password is "password"
  sql = " CALL `create_user`\n" +
  "('Bradley',\n" +
  " 'Peterson',\n" +
  " 'bp@email.com',\n" +
  " 'fbf7b4b732f920e2286cae97c7963dae73192d016b10c4e5799a8154f14bacb1',\n" +
  " '45848b4648c209a2',\n" +
  " 1,\n" +
  " @accountNumber, @createSuccess); select @accountNumber as 'newAccountNumber'";
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
  * test transfer - if no transaction exist
  ***************************************************************/
  sql = "SELECT count(*) as count from transaction";
  con.query(sql, function(err,rows){
    console.log("Current number of transactions: " + rows[0].count);
    const count = rows[0].count;
    const accountNumber1 = 111111, accountNumber2 = 111112, accountNumber3 = 111113; 


    if(count == 0){
      let sql = "CALL `deposit`(?, 1, 200, 'A deposit', @TransferSuccess);";
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
    }

    let sql = "CALL `get_account_balance`(?);";
    con.query(sql, [accountNumber1], function(err,rows){
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: CALL show balance of first account");
      console.log(rows[0]);
      // var keys = Object.keys( rows[1] );
      // for( var i = 0, length = keys.length; i < length; i++ ) {
      //     console.log(keys[i].valueOf())
      // }
    });
  });

  // sql = "CALL `get_account_transaction_history`(?);";
  // con.query(sql, [accountNumber1], function(err,rows){
  //   if (err) {
  //     console.log(err.message);
  //     throw err;
  //   }
  //   console.log("database.js: CALL show transaction history of the first account");
  //   console.log(rows[0]);

    
  //   // var keys = Object.keys( rows[1] );
  //   // for( var i = 0, length = keys.length; i < length; i++ ) {
  //   //     console.log(keys[i].valueOf())
  //   // }
  // });

  


} // end of addTableData()

module.exports = con;