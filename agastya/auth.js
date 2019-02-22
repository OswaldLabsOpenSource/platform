const constants = require("../constants");
const crypto = require("crypto");
const pool = require("../database");
const jwt = require("jsonwebtoken");
const verifyToken = require("./token");
const email = require("./email");
const stripe = require("../stripe");
const recaptcha = require("recaptcha2");
const recaptcha = new recaptcha({
	siteKey: constants.recaptcha.site,
	secretKey: constants.recaptcha.secret
});

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
						connection.release();
						res.status(401);
						res.json({ error: "invalid_credentials" });
					}
				});
			} else {
				connection.release();
				res.status(422);
				res.json({ error: "input_all_fields", fields: req.body });
			}
		}
	});
};

module.exports.details = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.get("Authorization")) {
				verifyToken(
					req.get("Authorization"),
					token => {
						connection.query("SELECT * FROM users WHERE id=? LIMIT 1", [token.user.id], function(
							error,
							results,
							fields
						) {
							connection.release();
							if (error || results.length === 0) {
								res.json({ error: "no_user" });
							} else {
								const user = results[0];
								res.json(user);
							}
						});
					},
					() => {
						res.status(401);
						res.json({ error: "invalid_token" });
					}
				);
			} else {
				res.status(422);
				res.json({ error: "no_token" });
			}
		}
	});
};

module.exports.forgot = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.body.email) {
				connection.query("SELECT id FROM users WHERE email=? LIMIT 1", [req.body.email], function(
					error,
					results,
					fields
				) {
					if (results.length > 0) {
						const resetCode = crypto.randomBytes(20).toString("hex");
						connection.query("UPDATE users SET reset_code = ? WHERE id = ?", [resetCode, results[0].id], function(
							error,
							results,
							fields
						) {
							connection.release();
							email(
								{
									to: req.body.email,
									subject: "Password Reset / Agastya by Oswald Labs",
									text: `Your code is ${resetCode}`,
									html: `<p>Your code is <strong>${resetCode}</strong></p>`
								},
								(err, info) => {
									if (err) {
										res.json({
											error: "unable_email",
											details: err
										});
									} else {
										res.json({
											sent: info
										});
									}
								}
							);
							if (error) throw error;
						});
					} else {
						connection.release();
						res.status(401);
						res.json({ error: "invalid_email" });
					}
				});
			} else {
				connection.release();
				res.status(422);
				res.json({ error: "input_all_fields" });
			}
		}
	});
};

module.exports.register = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.body.name && req.body.email && req.body.recaptcha) {
				recaptcha
					.validate(req.body.recaptcha)
					.then(() => {
						connection.query("SELECT id FROM users WHERE email=? LIMIT 1", [req.body.email], function(
							error,
							results,
							fields
						) {
							if (results.length === 0) {
								const resetCode = crypto.randomBytes(20).toString("hex");
								const apiKey = crypto.randomBytes(5).toString("hex");
								stripe.customers.create(
									{
										email: req.body.email
									},
									function(err, customer) {
										if (err) {
											res.json({ error: err.message });
										} else {
											const currentTime = new Date()
												.toISOString()
												.slice(0, 19)
												.replace("T", " ");
											connection.query(
												"INSERT INTO users (email, name, password, reset_code, api_key, subscribed, createdAt, affiliate_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
												[
													req.body.email,
													req.body.name,
													"not set",
													resetCode,
													apiKey,
													customer.id,
													currentTime,
													req.body.affiliate_id || NULL
												],
												function(error) {
													connection.release();
													email(
														{
															to: req.body.email,
															subject: "Verify Email / Agastya by Oswald Labs",
															text: `Your code is ${resetCode}`,
															html: `<p>Your code is <strong>${resetCode}</strong></p>`
														},
														(err, info) => {
															if (err) {
																res.json({
																	error: "unable_email",
																	details: err
																});
															} else {
																res.json({
																	sent: info
																});
															}
														}
													);
													if (error) throw error;
												}
											);
										}
									}
								);
							} else {
								connection.release();
								res.status(409);
								res.json({ error: "email_in_use" });
							}
						});
					})
					.catch(() => {
						connection.release();
						res.status(400).json({ error: "invalid_captcha" });
					});
			} else {
				connection.release();
				res.status(422);
				res.json({ error: "input_all_fields" });
			}
		}
	});
};

module.exports.reset = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.body.resetCode && req.body.password) {
				connection.query("SELECT id, email FROM users WHERE reset_code=? LIMIT 1", [req.body.resetCode], function(
					error,
					results,
					fields
				) {
					if (results.length > 0) {
						const userId = results[0].id;
						const hashedPassword = crypto
							.createHash("sha256")
							.update(`${req.body.password}${constants.salt}`)
							.digest("hex");
						connection.query(
							"UPDATE users SET password = ?, email_verified = 1, reset_code = NULL WHERE id = ?",
							[hashedPassword, results[0].id],
							function(error) {
								email(
									{
										to: results[0].email,
										subject: "Password Changed / Agastya by Oswald Labs",
										text: `Your password has been changed.`,
										html: `<p>Your password has been changed.</p>`
									},
									(err, info) => {
										connection.query(
											"SELECT id, email, name, joined, email_verified, subscribed, plan, api_key, pageviews_consumed, domains, notification_sent, notifications, customization, site_name FROM users WHERE id=? LIMIT 1",
											[userId],
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
									}
								);
								if (error) throw error;
							}
						);
					} else {
						connection.release();
						res.status(401);
						res.json({ error: "invalid_code" });
					}
				});
			} else {
				connection.release();
				res.status(422);
				res.json({ error: "input_all_fields" });
			}
		}
	});
};

module.exports.update = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.get("Authorization") && req.body) {
				verifyToken(
					req.get("Authorization"),
					token => {
						if ("password" in req.body) {
							const hashedPassword = crypto
								.createHash("sha256")
								.update(`${req.body.password}${constants.salt}`)
								.digest("hex");
							req.body.password = hashedPassword;
						}
						let query = "UPDATE users SET ";
						let i = 0;
						const length = Object.keys(req.body).length;
						if (length > 0) {
							for (update in req.body) {
								i++;
								query += `${update} = ${connection.escape(req.body[update])}, `;
							}
							query +=
								" password_last_updated = " +
								connection.escape(
									new Date()
										.toISOString()
										.slice(0, 19)
										.replace("T", " ")
								) +
								" WHERE id = " +
								connection.escape(token.user.id);
							connection.query(query, function(error, results, fields) {
								connection.release();
								res.json({ updated: true });
								if (error) throw error;
							});
						} else {
							connection.release();
							res.status(422);
							res.json({ error: "input_all_fields" });
						}
					},
					() => {
						connection.release();
						res.status(401);
						res.json({ error: "invalid_token" });
					}
				);
			} else {
				connection.release();
				res.status(422);
				res.json({ error: "no_token" });
			}
		}
	});
};
