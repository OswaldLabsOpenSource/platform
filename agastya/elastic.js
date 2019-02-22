const AWS = require("aws-sdk");
const escapeElastic = require("elasticsearch-sanitize");
const md5 = require("md5");
const jsonExport = require("jsonexport");
const constants = require("../constants");

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
			q: `ip:${md5(ip)}`
		})
		.then(response => {
			if (req.params.format === "json") {
				res.json(response.hits.hits || []);
			} else {
				jsonExport(response.hits.hits || [], (error, csv) => {
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
				query: { match: { ip: md5(ip) } },
				script: { inline: "ctx._source.ip = 'retracted-as-per-gdpr-request'" }
			}
		},
		(error, respose) => {
			if (error) return res.status(500).json({ error: "unable_to_delete" });
			res.json({ deleted: respose.updated });
		}
	);
};
