const axios = require("axios");
const sentry = require("../sentry");
sentry.init();

module.exports = (req, res) => {
	const netlifyUrl = `https://api.netlify.com/api/v1/badges/${req.params.key}/deploy-status`;
	axios
		.get(netlifyUrl)
		.then(response => {
			const badge = response.data;
			let status = "error";
			let color = "critical";
			if (badge.includes("#007A70")) {
				status = "success";
				color = "success";
			}
			if (badge.includes("#A88100")) {
				status = "building";
				color = "yellow";
			}
			res.json({
				schemaVersion: 1,
				label: "netlify",
				message: status,
				color
			});
		})
		.catch(() => {
			res.json({
				schemaVersion: 1,
				label: "netlify",
				message: "not found",
				color: "critical"
			});
		});
};
