const constants = require("../constants");
const crypto = require("crypto");
const pool = require("../database");
const jwt = require("jsonwebtoken");
const otplib = require("otplib");
const qrcode = require("qrcode");
const verifyToken = require("./token");
const email = require("./email");
const stripe = require("../stripe");
const reCaptcha = require("recaptcha2");
const recaptcha = new reCaptcha({
	siteKey: constants.recaptcha.site,
	secretKey: constants.recaptcha.secret
});
const sentry = require("../sentry");
sentry.init();

module.exports.enable2FA = (req, res) => {
	if (req.get("Authorization") && req.body) {
		verifyToken(
			req.get("Authorization"),
			token => {
				pool.getConnection((err, connection) => {
					if (err) return res.status(500).json({ error: "connection_error" });

					// Add 2fa_secret and 2fa_backup
					const secretCode = otplib.authenticator.generateSecret();
					const backupCode = crypto.randomBytes(4).toString("hex");

					connection.query(
						"UPDATE users SET 2fa_secret = ?, 2fa_backup = ? WHERE id = ?",
						[secretCode, backupCode, token.user.id],
						(error, results) => {
							if (error) return res.status(500).json({ error: "unable_to_update" });
							const otpauth = otplib.authenticator.keyuri(token.user.id, "Oswald Labs", secretCode);
							qrcode.toDataURL(otpauth, (err, imageUrl) => {
								if (err) return res.status(500).json({ error: "qr_code_error" });
								res.json({ imageUrl, backupCode });
							});
						}
					);
				});
			},
			() => res.status(401).json({ error: "invalid_token" })
		);
	} else {
		return res.status(422).json({ error: "no_token" });
	}
};

module.exports.verify2FA = (req, res) => {
	if (req.get("Authorization") && req.body) {
		verifyToken(
			req.get("Authorization"),
			token => {
				pool.getConnection((err, connection) => {
					if (err) return res.status(500).json({ error: "connection_error" });
					connection.query("SELECT 2fa_secret FROM users WHERE id = ?", [token.user.id], (error, results) => {
						if (error) return res.status(500).json({ error: "unable_to_update" });
						if (req.body.otp_code) {
							var isValid = otplib.authenticator.check(req.body.otp_code, results[0]["2fa_secret"]);
							if (isValid) {
								connection.query("UPDATE users SET 2fa = 1 WHERE id = ?", [token.user.id], (error, results) => {
									if (error) return res.status(500).json({ error: "unable_to_update" });
									return res.json({ success: true });
								});
							} else {
								return res.status(401).json({ error: "invalid_otp" });
							}
						} else {
							return res.status(422).json({ error: "no_otp" });
						}
					});
				});
			},
			() => res.status(401).json({ error: "invalid_token" })
		);
	} else {
		return res.status(422).json({ error: "no_token" });
	}
};

module.exports.verifyOTP = (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) {
			sentry.captureException(err);
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.body.otp_code && req.body.userId) {
				connection.query(
					"SELECT id, email, name, createdAt, updatedAt, email_verified, max_pageviews, subscribed, plan, api_key, pageviews_consumed, domains, notification_sent, pageviews_updated, notifications, customization, site_name, 2fa, 2fa_secret, 2fa_backup FROM users WHERE id= ? LIMIT 1",
					[req.body.userId],
					(error, results) => {
						connection.release();
						if (error) throw error;
						if (req.body.otp_code) {
							var isOTPValid = otplib.authenticator.check(parseInt(req.body.otp_code), results[0]["2fa_secret"]);
							if (isOTPValid || req.body.otp_code == results[0]["2fa_backup"]) {
								const user = results[0];
								delete user["2fa_secret"];
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
							} else {
								return res.status(401).json({ error: "invalid_otp" });
							}
						} else {
							return res.status(422).json({ error: "no_otp" });
						}
					}
				);
			} else {
				connection.release();
				return res.status(422).json({ error: "input_all_fields" });
			}
		}
	});
};

module.exports.login = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			sentry.captureException(err);
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
							"SELECT id, email, name, createdAt, updatedAt, email_verified, max_pageviews, subscribed, plan, api_key, pageviews_consumed, domains, notification_sent, pageviews_updated, notifications, customization, site_name, 2fa FROM users WHERE email=? LIMIT 1",
							[req.body.email],
							function(error, results, fields) {
								connection.release();
								const user = results[0];
								if (results[0]["2fa"]) {
									if (err) return res.status(500).json({ error: "qr_code_error" });
									jwt.sign(
										{ user },
										constants.secret,
										{
											expiresIn: "10 minutes"
										},
										function(err, token) {
											res.json({
												id: user["id"],
												token_2fa: token
											});
										}
									);
								} else {
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
								}
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

module.exports.disable2FA = (req, res) => {
	if (req.get("Authorization") && req.body) {
		verifyToken(
			req.get("Authorization"),
			token => {
				pool.getConnection((err, connection) => {
					if (err) return res.status(500).json({ error: "connection_error" });
					connection.query(
						"UPDATE users SET 2fa = 0, 2fa_secret = '', 2fa_backup = '' WHERE id = ?",
						[token.user.id],
						(error, results) => {
							if (error) return res.status(500).json({ error: "unable_to_update" });
							return res.sendStatus(200);
						}
					);
				});
			},
			() => res.status(401).json({ error: "invalid_token" })
		);
	} else {
		return res.status(422).json({ error: "no_token" });
	}
};

module.exports.details = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			sentry.captureException(err);
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
								delete user["2fa_secret"];
								delete user["2fa_backup"];
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
			sentry.captureException(err);
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
									text: `Click on the following link to reset your password: https://agastya.oswaldlabs.com/reset/${resetCode}`,
									html: `<p>Click on the following link to reset your password: <strong>https://agastya.oswaldlabs.com/reset/${resetCode}</strong></p>`
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
			sentry.captureException(err);
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
								stripe.init.customers.create(
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
															text: `Click on the following link to reset your password: https://agastya.oswaldlabs.com/reset/${resetCode}`,
															html: `<p>Click on the following link to reset your password: <stronghttps://agastya.oswaldlabs.com/reset/>${resetCode}</strong></p>`
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
			sentry.captureException(err);
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
												if (results.length === 1) {
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
												} else {
													res.json({
														updated: true
													});
												}
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
			sentry.captureException(err);
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
