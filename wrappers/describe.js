const axios = require("axios");

const describe = body =>
	new Promise((resolve, reject) => {
		axios
			.post(`https://westeurope.api.cognitive.microsoft.com/vision/v1.0/describe`, body, {
				headers: {
					"content-type": "application/octet-stream",
					"Ocp-Apim-Subscription-Key": process.env.AZURE
				}
			})
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				console.log(error.response.data);
				reject({ success: false, error: error.response.data });
			});
	});

module.exports.api = "describe";
module.exports.promise = describe;
module.exports.responder = (req, res) => {
	describe(req.body)
		.then(r => res.json(r))
		.catch(e => res.json(e));
};
