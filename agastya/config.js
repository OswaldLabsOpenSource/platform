const Fraud = require("fraud");

const database = new Fraud.default({
	directory: "./agastya-database"
});

module.exports.read = (req, res) => {
	let apiKey = req.params.apiKey;
	if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
	database
		.read(apiKey)
		.then(config => res.json(config))
		.catch(() => res.status(404).json({ error: "no_config" }));
};
