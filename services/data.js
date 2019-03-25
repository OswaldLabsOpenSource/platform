const data = require("../data.json");
const package = require("../package.json");
const sentry = require("../sentry");
sentry();

module.exports.json = (req, res) => {
	res.json({ ...data, version: package.version });
};

module.exports.shield = (req, res) => {
	res.json({ schemaVersion: 1, label: "this " + new Date().toLocaleString("en-us", { month: "long" }).toLowerCase(), message: parseInt(data.eventsThisMonth || 0).toLocaleString() });
};
