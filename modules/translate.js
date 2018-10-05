const translatte = require("translatte");

const translate = params =>
	new Promise((resolve, reject) => {
		translatte(params.q, { to: params.to, from: params.from })
			.then(res => resolve(res))
			.catch(err => reject(err));
	});

module.exports.promise = translate;
module.exports.responder = (req, res) => {
	req.params.from = req.params.from == "auto" ? undefined : req.params.from;
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/translate/${req.params.from}/${req.params.to}/${req.params.q}`;
	client.get(key, (error, reply) => {
		if (reply) {
			return res.json(JSON.parse(reply));
		} else {
			translate(req.params)
				.then(r => {
					res.json(r);
					client.set(key, JSON.stringify(r));
				})
				.catch(e => res.json(e));
		}
	});
};
