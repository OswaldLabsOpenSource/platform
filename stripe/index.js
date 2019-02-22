const constants = require("../constants");
const stripe = require("stripe")(constants.stripe);
const verifyToken = require("../agastya/token");
const pool = require("../database");
const jwt = require("jsonwebtoken");

module.exports = stripe;

module.exports.cards = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				stripe.customers.listCards(token.user.subscribed, function(err, cards) {
					if (err) {
						res.status(500);
						res.json({ error: err.message });
					} else {
						res.json(cards);
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
};

module.exports.createSubscription = (req, res) => {
	pool.getConnection(function(err, connection) {
		if (err) {
			connection.release();
			res.status(500);
			res.json({ error: "connection_error" });
		} else {
			if (req.get("Authorization") && req.body.plan) {
				verifyToken(
					req.get("Authorization"),
					token => {
						stripe.subscriptions.create(
							{
								customer: token.user.subscribed,
								items: [
									{
										plan: req.body.plan
									}
								]
							},
							function(err, subscription) {
								if (err) {
									connection.release();
									res.status(500);
									res.json({ error: err.message });
								} else {
									connection.query(
										"UPDATE users SET plan = ? WHERE id = ?",
										[req.body.plan, token.user.id],
										function(error) {
											connection.release();
											res.json(subscription);
											if (error) throw error;
										}
									);
								}
							}
						);
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
				res.json({ error: "fill_fields" });
			}
		}
	});
};

module.exports.createCard = (req, res) => {
	if (req.get("Authorization") && req.body) {
		verifyToken(
			req.get("Authorization"),
			token => {
				stripe.customers.createSource(token.user.subscribed, req.body, function(err, cards) {
					if (err) {
						res.status(500);
						res.json({ error: err.message });
					} else {
						res.json(cards);
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
};

module.exports.deleteCard = (req, res) => {
	if (req.get("Authorization") && req.query.cardId) {
		verifyToken(
			req.get("Authorization"),
			token => {
				stripe.customers.deleteCard(token.user.subscribed, req.query.cardId, function(err, cards) {
					if (err) {
						res.status(500);
						res.json({ error: err.message });
					} else {
						res.json(cards);
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
};

module.exports.updateCard = (req, res) => {
	if (req.get("Authorization") && req.params.cardId && req.body) {
		verifyToken(
			req.get("Authorization"),
			token => {
				stripe.customers.updateCard(token.user.subscribed, req.params.cardId, req.body, function(err, cards) {
					if (err) {
						res.status(500);
						res.json({ error: err.message });
					} else {
						res.json(cards);
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
						if (token.user.subscribed) {
							connection.release();
							stripe.customers.retrieve(token.user.subscribed, function(err, customer) {
								if (err) {
									res.status(500);
									res.json({ error: err.message });
								} else {
									res.json(customer);
								}
							});
						} else {
							stripe.customers.create(
								{
									email: token.user.email
								},
								function(err, customer) {
									if (err) {
										res.json({ error: err.message });
									} else {
										let query =
											"UPDATE users SET subscribed = '" +
											customer.id +
											"' WHERE id = " +
											connection.escape(token.user.id);
										connection.query(query, function(error, results, fields) {
											connection.release();
											res.json(customer);
										});
									}
								}
							);
						}
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

module.exports.invoices = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				stripe.invoices.list(
					{
						limit: 100,
						customer: token.user.subscribed
					},
					function(err, invoices) {
						if (err) {
							res.status(500);
							res.json({ error: err.message });
						} else {
							res.json(invoices);
						}
					}
				);
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
};

module.exports.plans = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				stripe.plans.list({ limit: 100 }, function(err, plans) {
					if (err) {
						res.status(204);
						res.json({ error: err.message });
					} else {
						for (let i = 0; i < plans.data.length; i++) {
							try {
								if (plans.data[i].nickname.indexOf("Custom Plan") > -1) {
									plans.data.splice(i, 1);
								}
							} catch (e) {}
						}
						res.json(plans);
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
};

module.exports.subscriptions = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				stripe.subscriptions.list(
					{
						limit: 100,
						customer: token.user.subscribed
					},
					function(err, subscriptions) {
						if (err) {
							res.status(500);
							res.json({ error: err.message });
						} else {
							res.json(subscriptions);
						}
					}
				);
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
};
