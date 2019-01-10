const axios = require("axios");
const fs = require("fs");

const screenshot = params =>
	new Promise((resolve, reject) => {
		axios
			.get(`http://api.screenshotlayer.com/api/capture?access_key=${process.env.SCREENSHOTLAYER}&url=${params.url}&viewport=1200x630&width=1200`)
			.then(response => {
				fs.writeFileSync("./cached/" + "params.url" + ".png", response.data);
				resolve({
					file: response.data
				});
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
