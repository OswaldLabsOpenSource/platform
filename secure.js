const jwt = require("jsonwebtoken");

module.exports.generate = (req, res) => {
	const token = jwt.sign(
		{
			permissions: req.body.permissions || "all"
		},
		req.body.secret || "",
		{ expiresIn: req.body.expire || "1y" }
	);
	res.json({ token });
};

module.exports.respond = (req, res, api) => {
	const apiKey = req.get("x-api-key");
	if (!apiKey) return res.status(401).json({ error: "no_api_key" });
	jwt.verify(apiKey, "secret", function(error, decoded) {
		if (error) return res.status(401).json({ error: "invalid_api_key" });
		if (decoded.permissions !== "all") return res.status(401).json({ error: "unauthorized_endpoint" });
		api.responder(req, res);
	});
};
