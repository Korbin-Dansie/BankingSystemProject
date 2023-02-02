var connectionInfo = {
    host: "127.0.0.1",
    port: 3306,
    user: process.env.SQLUSER,
    password: process.env.SQLPASSWORD
};

module.exports = connectionInfo;