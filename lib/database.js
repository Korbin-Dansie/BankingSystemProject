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
    let sql = "CREATE TABLE IF NOT EXISTS user (\n" +
      "user_id INT NOT NULL AUTO_INCREMENT, \n" +
      "PRIMARY KEY (user_id)\n" +
      ");";
    con.execute(sql, function (err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: table user created if it didn't exist");
      }
    });

} // end of createTables()
  
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
