module.exports = (req, res) => {
	res.json({
		schemaVersion: 1,
		label: "netlify",
		message: "update this badge (badges/shields#3129)",
		color: "critical"
	});
};
