const axios = require("axios");

const screenshot = params =>
	new Promise((resolve, reject) => {
		axios
			.get(`https://api.microlink.io/?url=${params.url}&screenshot&filter=screenshot`)
			.then(response => {
				resolve(response.data.data.screenshot.url.url);
			})
			.catch(error => {
				reject({ success: false, error: error.response.data.error });
			});
	});

module.exports.api = "screenshot";
module.exports.promise = screenshot;
module.exports.responder = (req, res) => {
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/screenshot/${req.params.url}`;
	client.get(key, (error, reply) => {
		if (reply && process.env.USER !== "anandchowdhary") {
			return res.redirect(reply);
		} else {
			screenshot(req.params)
				.then(r => {
					res.redirect(r);
					client.set(key, r);
				})
				.catch(e => res.json(e));
		}
	});
};
