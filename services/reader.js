const Mercury = require("@postlight/mercury-parser");
const path = require("path");
const fs = require("fs");
const md5 = require("md5");
const sentry = require("../sentry");
sentry.init();

module.exports = (req, res) => {
	const filePath = path.join(__dirname, "..", "cache", "reader", md5(req.query.url || req.body.url) + ".json");
	fs.exists(filePath, exists => {
		if (!exists) {
			Mercury.parse(req.query.url || req.body.url)
				.then(response => {
					fs.writeFile(filePath, JSON.stringify(response), () => {
						res.sendFile(filePath, { maxAge: 86400 });
					});
				})
				.catch(error => {
					sentry.captureException(error);
					console.log("Mercury error: ", error);
					res.json({ success: false, error });
				});
		} else {
			res.sendFile(filePath, { maxAge: 86400 });
		}
	});
};
