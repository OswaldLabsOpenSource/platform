const axios = require("axios");

module.exports = (req, res) => {
	axios
		.get(`http://ipinfo.io/${req.params.ip}/json?token=${process.env.IP_INFO}`)
		.then(response => res.json(response.data))
		.catch(error => {
			res.json({ success: false, error: error.response.data.error });
		});
};
