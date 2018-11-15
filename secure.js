const jwt = require("jsonwebtoken");
const cached = require("./cached");

module.exports.generate = (req, res) => {
	const token = jwt.sign(
		{
			permissions: req.body.permissions || "all",
			ip_restrictions: req.body.ip_restrictions,
			domain_restrictions: req.body.domain_restrictions,
			user: req.body.user
		},
		req.body.secret || "",
		{ expiresIn: req.body.expire || "1y" }
	);
	res.json({ token });
};

module.exports.respond = (req, res, api) => {
	const ipAddress =
		(req.headers["x-forwarded-for"] || "").split(",").pop() ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	const apiKey = req.get("x-api-key");
	if (!apiKey) return res.status(401).json({ error: "no_api_key" });
	jwt.verify(apiKey, process.env.JWT_SECRET, (error, decoded) => {
		if (error) return res.status(401).json({ error: "invalid_api_key", details: error });
		if (decoded.permissions !== "all" && typeof decoded.permissions === "object" && !decoded.permissions.includes(api.api))
			console.log({ error: "unauthorized_endpoint", permissions: decoded.permissions, api: api.api });
			return res.status(401).json({ error: "unauthorized_endpoint" });
		if (typeof decoded.ip_restrictions === "object" && !decoded.ip_restrictions.includes(ipAddress))
			console.log({ error: "unauthorized_ip_address", ip_restrictions: decoded.ip_restrictions, ipAddress: ipAddress });
			return res.status(401).json({ error: "unauthorized_ip_address" });
		if (typeof decoded.domain_restrictions === "object" && !decoded.domain_restrictions.includes(req.headers.host))
			console.log({ error: "unauthorized_cors_domain", domain_restrictions: decoded.domain_restrictions, domain: req.headers.host });
			return res.status(401).json({ error: "unauthorized_cors_domain" });
		cached(req, res, api);
	});
};
