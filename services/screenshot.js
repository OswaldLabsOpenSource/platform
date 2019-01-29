const webshot = require("node-webshot");
const path = require("path");
const md5 = require("md5");
const fs = require("fs");

module.exports = (req, res) => {
	const url = req.query.url || "https://oswaldlabs.com";
	let userAgent =
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36";
	const windowSize = {};
	windowSize.width = req.query.width || 1366;
	windowSize.height = req.query.height || 768;
	if (req.query.mobile) {
		windowSize.width = 320;
		windowSize.height = 480;
		userAgent =
			"Mozilla/5.0 (iPhone; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.25 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1";
	}
	const options = {
		userAgent,
		windowSize,
		defaultWhiteBackground: true,
		timeout: 10000,
		shotSize: {
			height: req.query.scroll ? "all" : "window",
			width: "window"
		}
	};
	const imagePath = path.join(__dirname, "..", "cache", md5(url + JSON.stringify(options)) + ".png");
	if (fs.existsSync(imagePath)) {
		res.sendFile(imagePath);
	} else {
		webshot(url, imagePath, options, err => {
			res.sendFile(imagePath);
		});
	}
};
