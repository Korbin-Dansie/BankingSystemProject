let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true              // Needed for stored proecures with OUT results
});

con.connect(function(err) {
  if (err) {
    throw err;
  }
  else {
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
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: Selected banking_system_project database");
        createTables();
        createStoredProcedures();
        addTableData();
      }
    });
}


function createTables() {
    // A CREATE TABLE call will work if it does not exist or if it does exist.
    let sql = "CREATE TABLE IF NOT EXISTS `user`(\n" +
    "  `user_id` int NOT NULL AUTO_INCREMENT,\n" +
    "  `user_first_name` varchar(50) NOT NULL,\n" +
    "  `user_last_name` varchar(50) NOT NULL,\n" +
    "  `hashed_password` varchar(255) NOT NULL,\n" +
    "  `salt` varchar(255) NOT NULL,\n" +
    "  `user_role_id` TINYINT(1) NOT NULL,\n" +
    "  PRIMARY KEY (`user_id`)\n" +
    ") COMMENT='This is for all the customers, employees, and admins.';\n" +
    "";

    con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table user created if it didn't exist");
      }
    });

    sql = "CREATE TABLE IF NOT EXISTS `user_type` (\n" +
    "  `user_type_id` TINYINT(1) NOT NULL AUTO_INCREMENT,\n" +
    "  `user_type` VARCHAR(25) NOT NULL,\n" +
    "  PRIMARY KEY (`user_type_id`))\n" +
    "COMMENT = 'customer, employee, admin';\n" +
    "";
    con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table user_type created if it didn't exist");
      }
    });

    sql = "CREATE TABLE IF NOT EXISTS `account`(\n" +
    "  `account_id` INT NOT NULL AUTO_INCREMENT,\n" +
    "  `user_id` INT NOT NULL,\n" +
    "  `account_number` VARCHAR(16) NOT NULL,\n" +
    "  `account_type` TINYINT(1) NOT NULL,\n" +
    "  PRIMARY KEY (`account_id`))\n" +
    "COMMENT = 'Each user has should have two accounts.\nI thought about creating a table to store just the account number (so I dont store duplicate information) but I thought it was a bit too complicated for this school assignment.';\n" +
    "";
    con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table account created if it didn't exist");
      }
    });


    sql = "CREATE TABLE IF NOT EXISTS `account_type`(\n" +
    "  `account_type_id` TINYINT(1) NOT NULL AUTO_INCREMENT,\n" +
    "  `account_type` VARCHAR(25) NOT NULL,\n" +
    "  PRIMARY KEY (`account_type_id`))\n" +
    "COMMENT = 'checking, savings';\n" +
    "";
    con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table account_type created if it didn't exist");
      }
    });

    sql = "CREATE TABLE `transaction` (\n" +
    "  `transaction_id` INT NOT NULL AUTO_INCREMENT,\n" +
    "  `from_account_id` INT NULL,\n" +
    "  `to_account_id` INT NULL,\n" +
    "  `transaction_amount` DECIMAL(10,2) NOT NULL,\n" +
    "  `memo` VARCHAR(255) NULL,\n" +
    "  `transaction_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n" +
    "  PRIMARY KEY (`transaction_id`))\n" +
    "COMMENT = 'From	+ NULL = Widthdraw\nTo	+ NULL = Deposit';\n";
    con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table account_type created if it didn't exist");
      }
    });

} // end of createTables()
  

function alterTables(){

}// end of alterTables()

function createStoredProcedures() {


} // end of createStoredProcedures()
  
function addTableData() {
    // let sql = "CALL insert_timing_type('saywordtext')";
    // con.query(sql, function(err,rows){
    //   if (err) {
    //     console.log(err.message);
    //     throw err;
    //   }
    //   console.log("database.js: Added 'saywordtext' to timing_types");
    // });

} // end of addTableData()

module.exports = con;
