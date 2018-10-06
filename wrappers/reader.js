const axios = require("axios");

const reader = params =>
	new Promise((resolve, reject) => {
		axios
			.get(`https://mercury.postlight.com/parser?url=${params.url}`, {
				headers: {
					"x-api-key": process.env.MERCURY
				}
			})
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				reject({ success: false, error: error.response.data.error });
			});
	});

module.exports.api = "reader";
module.exports.promise = reader;
module.exports.responder = (req, res) => {
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/reader/${req.params.url}`;
	client.get(key, (error, reply) => {
		if (reply && process.env.USER !== "anandchowdhary") {
			return res.json(JSON.parse(reply));
		} else {
			reader({
				url: decodeURI(req.params.url)
			})
				.then(r => {
					res.json(r);
					client.set(key, JSON.stringify(r));
				})
				.catch(e => res.json(e));
		}
	});
};
