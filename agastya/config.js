const Fraud = require("fraud");

const database = new Fraud.default({
	directory: "./agastya-database",
	update: () => {
		require("simple-git")()
			.add("*")
			.commit("Update Agastya database")
			.addRemote("origin", "https://github.com/AnandChowdhary/agastya-database.git")
			.push("origin", "master");
	}
});

module.exports.read = (req, res) => {
	let apiKey = req.params.apiKey;
	if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
	database
		.read(apiKey)
		.then(config => res.json(config))
		.then(() => database.create("hello", { world: true }))
		.catch(() => res.status(404).json({ error: "no_config" }));
};
