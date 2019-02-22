const mysql = require("mysql");
const constants = require("./constants");

const pool = mysql.createPool({
	host: constants.mysql.host,
	user: constants.mysql.user,
	port: constants.mysql.port,
	password: constants.mysql.password,
	database: constants.mysql.database
});

module.exports = pool;
