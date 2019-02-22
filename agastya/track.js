const WhichBrowser = require("which-browser");
const randomString = require("randomstring");
const parseDomain = require("parse-domain");
const maxMind = require("maxmind");
const geoLite2 = require("geolite2");
const md5 = require("md5");
const atob = require("atob");
const Fraud = require("fraud");
const database = new Fraud.default({
	directory: "./agastya-database"
});

const isEuCountry = data => {
	return [
		"Austria",
		"Italy",
		"Belgium",
		"Latvia",
		"Bulgaria",
		"Lithuania",
		"Croatia",
		"Luxembourg",
		"Cyprus",
		"Malta",
		"Czechia",
		"Netherlands",
		"Denmark",
		"Poland",
		"Estonia",
		"Portugal",
		"Finland",
		"Romania",
		"France",
		"Slovakia",
		"Germany",
		"Slovenia",
		"Greece",
		"Spain",
		"Hungary",
		"Sweden",
		"Ireland",
		"United Kingdom"
	].includes(data.country_name);
};

module.exports = (req, res) => {
	if (!req.body.api_key) return res.status(401).json({ error: "no_api_key" });

	// Global IP address
	let ip =
		req.headers["x-forwarded-for"] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		(req.connection.socket ? req.connection.socket.remoteAddress : null);
	ip = ip === "::1" ? "145.20.17.222" : ip;

	// Get geolocation from IP
	const getLocation = data =>
		new Promise(resolve => {
			const location = {};
			if (data.country_name && data.country_code && data.city) {
				data.geolocationCache = true;
				resolve(location);
			} else {
				maxMind.open(geoLite2.paths.city, (error, cityLookup) => {
					try {
						const ipLookup = cityLookup.get(ip);
						location.city = ipLookup.city.names.en;
						location.continent = ipLookup.continent.names.en;
						location.country_name = ipLookup.country.names.en;
						location.country_code = ipLookup.country.iso_code;
						location.latitude = ipLookup.location.latitude;
						location.longitude = ipLookup.location.longitude;
						location.time_zone = ipLookup.location.time_zone;
						location.accuracy_radius = ipLookup.location.accuracy_radius;
						location.zip_code = ipLookup.postal.code;
						location.region_name = ipLookup.subdivisions[0].names.en;
						location.region_code = ipLookup.subdivisions[0].iso_code;
					} catch (e) {}
					resolve(location);
				});
			}
		});

	// Add support for base64 encoded data
	const data = req.body || {};
	if (data.isEncoded) {
		Object.keys(data).forEach(key => {
			if (data.hasOwnProperty(key) && typeof data[key] !== "undefined" && key !== "isEncoded") {
				data[key] = atob(data[key]);
			}
		});
		delete data.isEncoded;
	}

	// Set basics
	data.ip = md5(ip);
	if (typeof data.event === "object") {
		data.event = data.event || {};
	} else {
		data.event = data.event || "pageview";
	}

	// Set referer
	if (typeof data.referrer === "string") {
		const refDetails = parseDomain(data.referrer);
		if (refDetails && typeof refDetails === "object") {
			if (refDetails.domain) data.referrer_name = refDetails.domain;
			if (refDetails.tld && refDetails.domain) data.referrer_domain = refDetails.domain + "." + refDetails.tld;
		} else {
			data.referrer_name = "unknown";
			data.referrer_domain = "unknown";
		}
	}

	// Set domain
	if (typeof data.url === "string") {
		const urlDetails = parseDomain(data.url);
		if (urlDetails && typeof urlDetails === "object") {
			if (urlDetails.domain) data.url_name = urlDetails.domain;
			if (urlDetails.tld && urlDetails.domain) data.url_domain = urlDetails.domain + "." + urlDetails.tld;
		} else {
			data.url_name = "unknown";
			data.url_domain = "unknown";
		}
	}

	// User agent
	let userAgent = {};
	data.user_agent_string = data.user_agent_string || req.headers["user-agent"];
	try {
		userAgent = new WhichBrowser(data.user_agent_string);
		if (data.browser_name && data.browser_version && data.os_name && data.os_version) {
			userAgentCache = true;
		} else {
			data.browser_name = userAgent.browser.name;
			data.browser_version = parseInt(
				userAgent.browser && typeof userAgent.browser.toString === "function"
					? userAgent.browser
							.toString()
							.replace(data.browser_name, "")
							.replace(/ /g, "")
					: null
			);
			data.browser_subversion = userAgent.browser.version.value;
			data.browser_stock = userAgent.browser.stock;
			data.os_name = userAgent.os.name;
			data.os_version = parseInt(userAgent.os.version.value.split(".")[0]);
			data.os_subversion = userAgent.os.version.value;
			data.os_build = userAgent.os.build;
			data.browser_engine = userAgent.engine.name;
			data.device_manufacturer = userAgent.device.manufacturer;
			data.device_model = userAgent.device.model;
			data.device_type = userAgent.device.type;
			data.device_subtype = userAgent.device.subtype;
			data.device_identifier = userAgent.device.identifier;
			if (!data.browser_version && data.browser_subversion) data.browser_version = parseInt(data.browser_subversion);
			if (!data.os_version && data.os_subversion) data.os_version = parseInt(data.os_subversion);
		}
	} catch (e) {}

	// Validate API key
	database
		.read(req.body.api_key)
		.then(config => {
			const domain = data.url_domain ? data.url_domain.replace("www.", "") : null;
			const domains = config.domains || [];

			if (!domain) return res.status(401).json({ error: "invalid_domain" });

			let includes = false;
			for (let i = 0; i < domains.length; i++) {
				domains[i] = domains[i].trim();
				if (domains[i] === "*" || domains[i] === domain || domains[i].endsWith(domain)) includes = true;
			}

			if (!includes) return res.status(401).json({ error: "invalid_domain" });

			getLocation(data)
				.then(location => {
					[
						"city",
						"continent",
						"country_name",
						"country_code",
						"latitude",
						"longitude",
						"time_zone",
						"accuracy_radius",
						"zip_code",
						"region_name",
						"region_code"
					].forEach(key => {
						if (location[key]) data[key] = location[key];
					});

					// Unique identifiers
					data.session_id = data.session_id || randomString.generate();
					data.ua_fp = md5(ip + data.browser_name + userAgent.toString());
					data.combined_fp = md5(
						data.session_id + data.ua_fp + new Date().getUTCFullYear() + "-" + new Date().getUTCMonth()
					);

					// Custom event support
					if (data.event && typeof data.event === "object") {
						Object.keys(data.event).forEach(key => {
							data[`custom_${key}`] = data.event[key];
						});
						delete data.event;
					}

					// Timestamps
					const currentDate = new Date();
					data.date = currentDate.toISOString();

					// Save this to elasticsearch

					res.json({
						status: "success",
						response: data,
						result: true,
						constants: {
							accessibility_options: "Accessibility options",
							loading: "Loading",
							close: "Close",
							eu_laws: isEuCountry(data)
						}
					});
				})
				.catch(() => res.status(500).json({ error: "internal_error" }));
		})
		.catch(() => res.status(404).json({ error: "invalid_api_key" }));
};
