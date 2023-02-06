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
  let sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP insert_account_type created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP insert_user_type created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP create_user created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP change_user_type created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP create_account created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP create_account_number created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP getAccountID created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_balance created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_balance_by_account_id created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_account_balance created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP transfer created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP deposit created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP withdraw created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_transaction_history created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP get_account_transaction_history created if it didn't exist");
    }
  });

  sql = "";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: SP check_credentials created if it didn't exist");
    }
  });

  sql = "";
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

  // let sql = "CALL insert_user_type('customer')";
  // con.query(sql, function(err,rows){
  //   if (err) {
  //     console.log(err.message);
  //     throw err;
  //   }
  //   console.log("database.js: Added 'customer' to user_type");
  // });

} // end of addTableData()

module.exports = con;