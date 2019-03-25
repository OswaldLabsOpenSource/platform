const constants = require("../constants");
const formData = require("form-data");
const microsoftComputerVision = require("microsoft-computer-vision");
const sentry = require("../sentry");
sentry();

module.exports = (req, res) => {
	const FormData = new formData();
	const bufferFile = new Buffer(req.body.dataUri.replace(/^data:image\/\w+;base64,/, ""), "base64");
	FormData.append("file", bufferFile);
	microsoftComputerVision
		.describeImage({
			"Ocp-Apim-Subscription-Key": constants.azure,
			"request-origin": "westeurope",
			"max-candidates": "1",
			"content-type": "application/octet-stream",
			body: bufferFile,
			"visual-features": "Tags, Faces"
		})
		.then(result => {
			res.json(result);
		})
		.catch(error => {
			res.status(400).json({ error: "ok" });
		});
};
