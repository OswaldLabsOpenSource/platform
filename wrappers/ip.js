const axios = require("axios");

const ip = params =>
	new Promise((resolve, reject) => {
		axios
			.get(`http://ipinfo.io/${params.ip}/json?token=${process.env.IP_INFO}`)
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				reject({ success: false, error: error.response.data.error });
			});
	});

module.exports.api = "ip";
module.exports.promise = ip;
module.exports.responder = (req, res) => {
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/ip/${req.params.ip}`;
	client.get(key, (error, reply) => {
		if (reply && process.env.USER !== "anandchowdhary") {
			return res.json(JSON.parse(reply));
		} else {
			ip(req.params)
				.then(r => {
					res.json(r);
					client.set(key, JSON.stringify(r));
				})
				.catch(e => res.json(e));
		}
	});
};
