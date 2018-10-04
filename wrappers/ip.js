const axios = require("axios");
const client = require("redis").createClient(process.env.REDIS_URL);
client.on("error", error => new Error(error));

module.exports = (req, res) => {
	const key = `wrappers/ip/${req.params.lat}/${req.params.lng}`;
	client.get(key, (error, reply) => {
		if (reply) {
			return res.json(JSON.parse(reply));
		} else {
			axios
				.get(`http://ipinfo.io/${req.params.ip}/json?token=${process.env.IP_INFO}`)
				.then(response => {
					res.json(response.data);
					client.set(key, JSON.stringify(response.data));
				})
				.catch(error => {
					res.json({ success: false, error: error.response.data.error });
				});
		}
	});
};
