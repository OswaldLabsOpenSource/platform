const WhichBrowser = require("which-browser");
const maxMind = require("maxmind");
const geoLite2 = require("geolite2");
const Fraud = require("fraud");
const pool = require("../database");
const email = require("./email");
const sentry = require("../sentry");
sentry.init();

const database = new Fraud.default({
	directory: "./agastya-database",
	softDelete: true
});

module.exports = (req, res) => {
	let ip =
		req.headers["x-forwarded-for"] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		(req.connection.socket ? req.connection.socket.remoteAddress : null);
	ip = ip === "::1" ? "145.20.17.222" : ip;
	if (req.params.apiKey && req.body.email && req.body.message) {
		database
			.read(req.params.apiKey)
			.then(config => {
				const userId = config.owner;
				pool.getConnection(function(err, connection) {
					if (err) {
						res.status(500).json({ error: "connection_error" });
					} else {
						connection.query("SELECT email FROM users WHERE id = ? LIMIT 1", [userId], (error, results) => {
							if (error || !results.length) {
								res.status(500).json({ error: "connection_error" });
							} else {
								const sendTo = results[0].email;
								userAgent = new WhichBrowser(req.headers["user-agent"]).toString();
								maxMind.open(geoLite2.paths.city, (error, cityLookup) => {
									let city = "Unknown city";
									let region_name = "Unknown region";
									let country_name = "Unknown country";
									let accuracy_radius = "0 km";
									try {
										const ipLookup = cityLookup.get(ip);
										city = ipLookup.city.names.en;
										region_name = ipLookup.subdivisions[0].names.en;
										country_name = ipLookup.country.names.en;
										accuracy_radius = parseInt(ipLookup.location.accuracy_radius) + " km";
									} catch (e) {}
									let text = "You have a new submission on your Agastya contact form:\n\n";
									Object.keys(req.body).forEach(key => {
										if (req.body.hasOwnProperty(key)) {
											text += `${key}: ${req.body[key]}\n\n`;
										}
									});
									if (city) text += `city: ${city}\n\n`;
									if (region_name) text += `region_name: ${region_name}\n\n`;
									if (country_name) text += `country_name: ${country_name}\n\n`;
									if (accuracy_radius) text += `accuracy_radius: ${accuracy_radius}\n\n`;
									if (userAgent) text += `userAgent: ${userAgent}\n\n`;
									email(
										{
											to: sendTo,
											subject: "Agastya / New submission",
											text
										},
										() => {
											res.json({ sent: true });
										}
									);
								});
							}
						});
					}
				});
			})
			.catch(error => {
				res.status(500).json({ error: "internal_error" });
				console.log(error);
			});
	} else {
		res.status(422).json({ error: "input_all_fields" });
	}
};
