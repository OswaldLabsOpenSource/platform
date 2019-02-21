const Fraud = require("fraud");

module.exports = (req, res) => {
	const database = new Fraud.default({
		directory: "./database"
	});
	let apiKey = req.params.apiKey;
	if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
	database
		.read(apiKey)
		.then(config => res.json(config))
		.catch(() => res.status(404).json({ error: "no_config" }));
};
