const axios = require("axios");

module.exports = (req, res) => {
	axios
		.get(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.params.lat},${
				req.params.lng
			}&key=${process.env.GOOGLE_CLOUD}`
		)
		.then(response => res.json(response.data))
		.catch(error => {
			res.json({ success: false, error: error.response.data.error });
		});
};
