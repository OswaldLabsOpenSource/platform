const AWS = require("aws-sdk");
const Fraud = require("fraud");
const serial = require("promise-serial");
const constants = require("../../constants");
const pool = require("../../database");
const fs = require("fs");
const path = require("path");
const sentry = require("../../sentry");
sentry.init();

const database = new Fraud.default({
	directory: "./agastya-database",
	softDelete: true
});

AWS.config.update({
	credentials: new AWS.Credentials(constants.awsElasticSearch.access, constants.awsElasticSearch.secret),
	region: "eu-west-3"
});

const client = require("elasticsearch").Client({
	host: constants.elastic,
	connectionClass: require("http-aws-es")
});

module.exports = () => {
	database
		.readAll()
		.then(list => {
			const uniques = {};
			Object.keys(list).forEach(key => {
				if (list.hasOwnProperty(key)) {
					uniques[list[key].owner] = uniques[list[key].owner] || [];
					uniques[list[key].owner].push(key);
				}
			});
			return uniques;
		})
		.then(uniques => {
			let grandTotal = 0;
			const userPromises = Object.keys(uniques).map(userId => () =>
				new Promise((resolve, reject) => {
					let total = 0;
					const insidePromises = uniques[userId].map(apiKey => () =>
						new Promise((resolveInside, rejectInside) => {
							client
								.search({
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
																gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
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
									total += response.hits.total;
									resolveInside();
								})
								.catch(error => rejectInside(error));
						})
					);
					serial(insidePromises).then(() => {
						grandTotal += total;
						pool.getConnection(function(error, connection) {
							if (error) {
								return reject(error);
							} else {
								connection.query(
									"UPDATE users SET pageviews_consumed=?, pageviews_updated=? WHERE id=?",
									[total, Math.ceil(new Date().getTime() / 1000), userId],
									error => {
										connection.release();
										if (error) return reject(error);
										resolve();
									}
								);
							}
						});
					});
				})
			);
			serial(userPromises).then(() => {
				fs.writeFile(
					path.join(__dirname, "..", "..", "data.json"),
					JSON.stringify({
						eventsThisMonth: grandTotal,
						lastUpdated: new Date()
					}),
					() => process.exit()
				);
			});
		});
};
