const data = require("../data.json");
const package = require("../package.json");

module.exports = (req, res) => {
	res.json({ ...data, version: package.version });
};
