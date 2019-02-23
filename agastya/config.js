const Fraud = require("fraud");
const verifyToken = require("./token");
const crypto = require("crypto");

const database = new Fraud.default({
	directory: "./agastya-database"
});

module.exports.read = (req, res) => {
	let apiKey = req.params.apiKey || "";
	if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
	database
		.read(apiKey)
		.then(config => res.json(config))
		.catch(() => res.status(404).json({ error: "no_config" }));
};

module.exports.list = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				database
					.readAll()
					.then(list => {
						const apiKeys = {};
						Object.keys(list).forEach(key => {
							if (list.hasOwnProperty(key))
								if (parseInt(list[key].owner) === parseInt(id)) apiKeys[key] = list[key];
						});
						return apiKeys;
					})
					.then(config => res.json(config))
					.catch(() => res.status(500).json({ error: "error" }));
			},
			() => {
				res.status(401);
				res.json({ error: "invalid_token" });
			}
		);
	} else {
		res.status(422);
		res.json({ error: "no_token" });
	}
};

module.exports.create = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				const apiKey = crypto.randomBytes(5).toString("hex");
				delete req.body.owner;
				database
					.exists(apiKey)
					.then(exists => {
						if (!exists) return apiKey;
						throw new Error("exists");
					})
					.then(() => database.create(apiKey, { ...req.body, owner: id }))
					.then(() => res.json({ created: apiKey }))
					.catch(() => res.status(500).json({ error: "error" }));
			},
			() => {
				res.status(401);
				res.json({ error: "invalid_token" });
			}
		);
	} else {
		res.status(422);
		res.json({ error: "no_token" });
	}
};

module.exports.update = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				let apiKey = req.params.apiKey || "";
				if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
				delete req.body.owner;
				database
					.exists(apiKey)
					.then(exists => {
						if (exists) return apiKey;
						throw new Error("does-not-exist");
					})
					.then(() => database.read(apiKey))
					.then(contents => {
						if (parseInt(contents.owner) === parseInt(id)) return contents;
						throw new Error("not-owner");
					})
					.then(() => database.update(apiKey, req.body))
					.then(() => res.json({ updated: apiKey }))
					.catch(() => res.status(500).json({ error: "error" }));
			},
			() => {
				res.status(401);
				res.json({ error: "invalid_token" });
			}
		);
	} else {
		res.status(422);
		res.json({ error: "no_token" });
	}
};

module.exports.delete = (req, res) => {
	if (req.get("Authorization")) {
		verifyToken(
			req.get("Authorization"),
			token => {
				let id = 0;
				try {
					id = token.user.id;
				} catch (e) {}
				let apiKey = req.params.apiKey || "";
				if (apiKey.includes(".json")) apiKey = apiKey.replace(".json", "");
				database
					.exists(apiKey)
					.then(exists => {
						if (exists) return apiKey;
						throw new Error("does-not-exist");
					})
					.then(() => database.read(apiKey))
					.then(contents => {
						if (parseInt(contents.owner) === parseInt(id)) return contents;
						throw new Error("not-owner");
					})
					.then(() => database.delete(apiKey))
					.then(() => res.json({ deleted: apiKey }))
					.catch(() => res.status(500).json({ error: "error" }));
			},
			() => {
				res.status(401);
				res.json({ error: "invalid_token" });
			}
		);
	} else {
		res.status(422);
		res.json({ error: "no_token" });
	}
};
