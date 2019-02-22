const puppeteer = require("puppeteer");
const path = require("path");
const md5 = require("md5");
const fs = require("fs");

module.exports = (req, res) => {
	const url = req.query.url || "https://oswaldlabs.com";
	const options = {
		url,
		width: req.query.width || 1366,
		height: req.query.height || 768,
		mobile: req.query.mobile
	};
	const imagePath = path.join(__dirname, "..", "cache", md5(url + JSON.stringify(options)) + ".png");

	if (fs.existsSync(imagePath) && !req.query.refresh) {
		res.sendFile(imagePath);
	} else {
		takeShot(options, imagePath)
			.then(() => {
				res.sendFile(imagePath);
			})
			.catch(e => {
				console.log("Error!", e);
				res.json(e);
			});
	}
};

const takeShot = async (options, path) => {
	const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
	const page = await browser.newPage();
	if (options.mobile) {
		page.setUserAgent(
			"Mozilla/5.0 (iPhone; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.25 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
		);
		page.setViewport({
			height: 640,
			width: 360,
			deviceScaleFactor: 2
		});
	} else {
		page.setViewport({
			height: options.height,
			width: options.width
		});
	}
	await page.goto(options.url);
	await page.screenshot({ path });
	await browser.close();
};
