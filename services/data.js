const data = require("../data.json");
const package = require("../package.json");

module.exports = (req, res) => {
	res.json({ ...data, version: package.version, schemaVersion: 1, label: "month", message: parseInt(data.eventsThisMonth || 0).toLocaleString() });
};
