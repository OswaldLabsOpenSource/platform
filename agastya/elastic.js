const AWS = require("aws-sdk");
const sanitize = require("elasticsearch-sanitize");
const pool = require("../database");
const verifyToken = require("./token");
const serial = require("promise-serial");
const md5 = require("md5");
const jsonExport = require("jsonexport");
const constants = require("../constants");
const Fraud = require("fraud");

const database = new Fraud.default({
	directory: "./agastya-database"
});

AWS.config.update({
	credentials: new AWS.Credentials(constants.awsElasticSearch.access, constants.awsElasticSearch.secret),
	region: "eu-west-3"
});

const client = require("elasticsearch").Client({
	host: "search-a11y-l54fuy34twgibou26fo4g2pmr4.eu-west-3.es.amazonaws.com",
	connectionClass: require("http-aws-es")
});

module.exports.export = (req, res) => {
	let ip =
		req.headers["x-forwarded-for"] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		(req.connection.socket ? req.connection.socket.remoteAddress : null);
	ip = ip === "::1" ? "145.20.17.222" : ip;
	client
		.search({
			q: `ip:${sanitize(md5(ip))}`,
			size: 1000
		})
		.then(response => {
			let data = [];
			let originalData = response.hits.hits || [];
			for (let i = 0; i < originalData.length; i++) {
				try {
					data.push(originalData[i]._source);
				} catch (e) {}
			}
			if (req.params.format === "json") {
				res.json(data);
			} else {
				jsonExport(data, (error, csv) => {
					if (error) return res.status(400).json({ error: true });
					res.attachment("export.csv");
					res.send(csv);
				});
			}
		})
		.catch(() => res.status(400).json({ error: true }));
};

module.exports.delete = (req, res) => {
	let ip =
		req.headers["x-forwarded-for"] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		(req.connection.socket ? req.connection.socket.remoteAddress : null);
	ip = ip === "::1" ? "145.20.17.222" : ip;
	client.updateByQuery(
		{
			index: `${new Date().getUTCFullYear()}-*`,
			body: {
				query: { match: { ip: sanitize(md5(ip)) } },
				script: { inline: "ctx._source.ip = 'retracted-as-per-gdpr-request'" }
			}
		},
		(error, response) => {
			if (error) return res.status(500).json({ error: "unable_to_delete" });
			res.json({ deleted: response.updated });
		}
	);
};

module.exports.recents = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				let apiKey = req.body.apiKey || "";
				if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
				delete req.body.owner;
				database
					.read(apiKey)
					.then(contents => {
						if (parseInt(contents.owner) === parseInt(id)) return contents;
						throw new Error("not-owner");
					})
					.then(() =>
						client.search({
							index: "2019-*",
							body: {
								query: {
									bool: {
										must: [
											{
												match: {
													api_key: apiKey
												}
											},
											{
												range: {
													date: {
														gte: `now-${req.body.ago || "15m"}`
													}
												}
											}
										]
									}
								},
								sort: [
									{
										date: { order: "desc" }
									}
								],
								size: parseInt(req.body.size || 10) < 100 ? parseInt(req.body.size || 10) : 10
							}
						})
					)
					.then(response => res.json(response))
					.catch(error => {
						res.status(500).json({ error: "error" });
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

module.exports.explore = (req, res) => {
	if (req.get("Authorization")) {
		if (!req.body.apiKey && req.body.fingerprint) return res.status(401).json({ error: "incomplete_fields" });
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				let apiKey = req.body.apiKey || "";
				if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
				delete req.body.owner;
				database
					.read(apiKey)
					.then(contents => {
						if (parseInt(contents.owner) === parseInt(id)) return contents;
						throw new Error("not-owner");
					})
					.then(() =>
						client.search({
							index: "2019-*",
							body: {
								size: 100,
								query: {
									bool: {
										must: [
											{
												match: {
													api_key: apiKey
												}
											},
											{
												match: {
													combined_fp: req.body.fingerprint
												}
											}
										]
									}
								},
								sort: [
									{
										date: { order: "desc" }
									}
								],
								size: parseInt(req.body.size || 10) < 100 ? parseInt(req.body.size || 10) : 10
							}
						})
					)
					.then(response => res.json(response))
					.catch(error => {
						res.status(500).json({ error: "error" });
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

module.exports.sorted = (req, res) => {
	if (req.get("Authorization")) {
		if (!req.body.apiKey && req.body.fingerprint && req.body.key && req.body.value)
			return res.status(401).json({ error: "incomplete_fields" });
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				let apiKey = req.body.apiKey || "";
				if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
				delete req.body.owner;
				const keyValuePair = {};
				keyValuePair[req.body.key] = req.body.value;
				database
					.read(apiKey)
					.then(contents => {
						if (parseInt(contents.owner) === parseInt(id)) return contents;
						throw new Error("not-owner");
					})
					.then(() =>
						client.search({
							index: "2019-*",
							body: {
								query: {
									bool: {
										must: [
											{
												match: {
													api_key: apiKey
												}
											},
											{
												match: keyValuePair
											},
											{
												range: {
													date: {
														gte: `now-${req.body.ago || "15m"}`
													}
												}
											}
										]
									}
								},
								sort: [
									{
										date: { order: "desc" }
									}
								],
								size: parseInt(req.body.size || 10) < 100 ? parseInt(req.body.size || 10) : 10
							}
						})
					)
					.then(response => res.json(response))
					.catch(error => {
						res.status(500).json({ error: "error" });
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

module.exports.graphs = (req, res) => {
	if (req.get("Authorization")) {
		if (!req.body.apiKey && req.body.key) return res.status(401).json({ error: "incomplete_fields" });
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				let apiKey = req.body.apiKey || "";
				if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
				delete req.body.owner;
				database
					.read(apiKey)
					.then(contents => {
						if (parseInt(contents.owner) === parseInt(id)) return contents;
						throw new Error("not-owner");
					})
					.then(() =>
						client.search({
							index: "2019-*",
							body: {
								query: {
									bool: {
										must: [
											{
												match: {
													api_key: apiKey
												}
											}
										]
									}
								},
								aggs: {
									keywords: {
										significant_text: {
											field: req.body.key
										}
									}
								},
								size: parseInt(req.body.size || 10) < 100 ? parseInt(req.body.size || 10) : 10
							}
						})
					)
					.then(response => res.json(response))
					.catch(error => {
						console.log(error);
						res.status(500).json({ error: "error" });
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

module.exports.quota = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				delete req.body.owner;
				const responses = [];
				database
					.readAll()
					.then(list => {
						const apiKeys = {};
						Object.keys(list).forEach(key => {
							if (list.hasOwnProperty(key))
								if (parseInt(list[key].owner) === parseInt(id)) apiKeys[key] = list[key];
						});
						return Object.keys(apiKeys);
					})
					.then(apiKeys => {
						const promises = apiKeys.map(key => () =>
							new Promise((resolve, reject) => {
								client
									.search({
										index: "2019-*",
										body: {
											query: {
												bool: {
													must: [
														{
															match: {
																api_key: key
															}
														},
														{
															range: {
																date: {
																	gte: new Date(
																		new Date().getFullYear(),
																		new Date().getMonth(),
																		1
																	)
																}
															}
														}
													]
												}
											},
											size: 0
										}
									})
									.then(response => {
										responses.push(response);
										resolve(response);
									})
									.catch(error => reject(error));
							})
						);
						serial(promises)
							.then(() => {
								let total = 0;
								responses.forEach(response => {
									try {
										total += response.hits.total;
									} catch (e) {}
								});
								return total;
							})
							.then(total => {
								pool.getConnection(function(err, connection) {
									if (err) {
										return res.status(500).json({ error: "connection_error" });
									} else {
										connection.query(
											"UPDATE users SET pageviews_consumed=?, pageviews_updated=? WHERE id=?",
											[total, Math.ceil(new Date().getTime() / 1000), id],
											error => {
												connection.release();
												if (error) return res.status(500).json({ error: "database_error" });
												res.json({ total });
											}
										);
									}
								});
							})
							.catch(error => {
								console.log("Error", error);
								res.status(500).json({ error: "error" });
							});
					})
					.catch(error => {
						res.status(500).json({ error: "error" });
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
