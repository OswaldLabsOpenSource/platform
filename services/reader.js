const axios = require("axios");
const constants = require("../constants");

module.exports = (req, res) =>
	axios
		.get(`https://mercury.postlight.com/parser?url=${req.query.url || req.body.url}`, {
			headers: {
				"x-api-key": constants.mercury
			}
		})
		.then(response => {
			res.json(response.data);
		})
		.catch(error => {
			res.json({ success: false, error: error.response.data.error });
		});
