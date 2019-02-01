const mongoose = require("mongoose");
const schema = require("./schema");

const Instance = mongoose.model("Instance", schema);

module.exports = (req, res) => {
	mongoose
		.connect(
			process.env.MONGO,
			{ useNewUrlParser: true }
		)
		.then(() => {
			Instance.find(
				{
					apiKey: req.params.apiKey.replace(".json", "")
				},
				(error, response) => {
					if (error) {
						res.status(500).json({ error });
					} else {
						if (response.length) {
							res.json(response[0]);
						} else {
							res.status(404).json({ error: "invalid_key" });
						}
					}
				}
			);
		})
		.catch(error => res.status(500).json({ error }));
};
