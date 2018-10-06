const googleTranslate = require("google-translate")(process.env.GOOGLE_CLOUD);

const translate = params =>
	new Promise((resolve, reject) => {
		googleTranslate.translate(params.q, params.to, (error, translation) => {
			if (error) return reject(error);
			resolve(translation);
		});
	});

module.exports.api = "translate";
module.exports.promise = translate;
module.exports.responder = (req, res) => {
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/translate/${req.params.from}/${req.params.to}/${req.params.q}`;
	client.get(key, (error, reply) => {
		if (reply && process.env.USER !== "anandchowdhary") {
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
