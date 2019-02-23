const AWS = require("aws-sdk");
const sanitize = require("elasticsearch-sanitize");
const verifyToken = require("./token");
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
		(error, respose) => {
			if (error) return res.status(500).json({ error: "unable_to_delete" });
			res.json({ deleted: respose.updated });
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
						console.log("error", error.toJSON());
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
