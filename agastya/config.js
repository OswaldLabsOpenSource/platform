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

module.exports.list = (req, res) => {
	database
		.readAll()
		.then(list => {
			const apiKeys = {};
			Object.keys(list).forEach(key => {
				if (list.hasOwnProperty(key)) if (list[key].owner == 1) apiKeys[key] = list[key];
			});
			return apiKeys;
		})
		.then(config => res.json(config))
		.catch(error => {
			console.log(error);
			res.status(404).json({ error: "no_api_keys" });
		});
};
