const axios = require("axios");
const formData = require("form-data");
const microsoftComputerVision = require("microsoft-computer-vision");

const describe = body =>
	new Promise((resolve, reject) => {
		const FormData = new formData();
		const bufferFile = new Buffer(body.dataUri.replace(/^data:image\/\w+;base64,/, ""), "base64");
		FormData.append("file", bufferFile);
		microsoftComputerVision
			.describeImage({
				"Ocp-Apim-Subscription-Key": process.env.AZURE,
				"request-origin": "westeurope",
				"max-candidates": "1",
				"content-type": "application/octet-stream",
				body: bufferFile,
				"visual-features": "Tags, Faces"
			})
			.then(result => {
				console.log("OK", result);
				resolve(result);
			})
			.catch(error => {
				console.log("Err", error);
				reject({ error: "ok" });
			});
	});

module.exports.api = "describe";
module.exports.promise = describe;
module.exports.responder = (req, res) => {
	describe(req.body)
		.then(r => res.json(r))
		.catch(e => res.json(e));
};
