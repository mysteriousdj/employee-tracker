const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",

    port: ,

    user: "",

    password: "",
    database: "employee_management_db"

});

module.exports = connection;