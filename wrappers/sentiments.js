const axios = require("axios");

const sentiments = params =>
	new Promise((resolve, reject) => {
		axios
			.get(
				`https://jamiembrown-tweet-sentiment-analysis.p.mashape.com/api/?text==${params.text}`,
				{
					headers: {
						"X-Mashape-Key": process.env.MASHAPE
					}
				}
			)
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				reject({ success: false, error: error.response.data.error });
			});
	});

module.exports.api = "sentiments";
module.exports.promise = sentiments;
module.exports.responder = (req, res) => {
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/sentiments/${req.params.lat}/${req.params.lng}`;
	client.get(key, (error, reply) => {
		if (reply && process.env.USER !== "anandchowdhary") {
			return res.json(JSON.parse(reply));
		} else {
			sentiments(req.params)
				.then(r => {
					res.json(r);
					client.set(key, JSON.stringify(r));
				})
				.catch(e => res.json(e));
		}
	});
};
