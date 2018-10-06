const axios = require("axios");

const geocode = params =>
	new Promise((resolve, reject) => {
		axios
			.get(
				`https://maps.googleapis.com/maps/api/geocode/json?latlng=${params.lat},${params.lng}&key=${
					process.env.GOOGLE_CLOUD
				}`
			)
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				reject({ success: false, error: error.response.data.error });
			});
	});

module.exports.api = "geocode";
module.exports.promise = geocode;
module.exports.responder = (req, res) => {
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/geocode/${req.params.lat}/${req.params.lng}`;
	client.get(key, (error, reply) => {
		if (reply && process.env.USER !== "anandchowdhary") {
			return res.json(JSON.parse(reply));
		} else {
			geocode(req.params)
				.then(r => {
					res.json(r);
					client.set(key, JSON.stringify(r));
				})
				.catch(e => res.json(e));
		}
	});
};
