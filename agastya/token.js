const constants = require("../constants");
const jwt = require("jsonwebtoken");
const sentry = require("../sentry");
sentry();

module.exports = (token, callback = () => {}, error = () => {}) => {
	if (!token) {
		return false;
	}
	token = token.replace("Bearer ", "");
	jwt.verify(token, constants.secret, function(err, decoded) {
		if (!err) {
			callback(decoded);
		} else {
			error();
		}
	});
};
