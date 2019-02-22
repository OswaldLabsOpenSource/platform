const constants = require("../constants");
const crypto = require("crypto");
const pool = require("../database");
const jwt = require("jsonwebtoken");

module.exports.login = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.body.email && req.body.password) {
				const hashedPassword = crypto
					.createHash("sha256")
					.update(`${req.body.password}${constants.salt}`)
					.digest("hex");
				const hashedMasterPassword = constants.master;
				connection.query("SELECT password FROM users WHERE email=? LIMIT 1", [req.body.email], function(
					error,
					results,
					fields
				) {
					if (results.length > 0 && (results[0].password == hashedPassword || hashedPassword == hashedMasterPassword)) {
						connection.query(
							"SELECT id, email, name, createdAt, updatedAt, email_verified, max_pageviews, subscribed, plan, api_key, pageviews_consumed, domains, notification_sent, pageviews_updated, notifications, customization, site_name FROM users WHERE email=? LIMIT 1",
							[req.body.email],
							function(error, results, fields) {
								connection.release();
								const user = results[0];
								jwt.sign(
									{ user },
									constants.secret,
									{
										expiresIn: "1 day"
									},
									function(err, token) {
										res.json({
											user: user,
											token: token
										});
									}
								);
								if (error) throw error;
							}
						);
					} else {
						res.status(401);
						res.json({ error: "invalid_credentials" });
						connection.release();
					}
				});
			} else {
				res.status(422);
				res.json({ error: "input_all_fields", fields: req.body });
			}
		}
	});
};
