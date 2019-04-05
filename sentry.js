const Sentry = require("@sentry/node");
const constants = require("./constants");

module.exports.init = () => {
	if (constants.environment === "production")
		Sentry.init({ dsn: "https://958692a6eb8a409abbd72fd22298c03c@sentry.io/1254255" });
};

module.exports.captureException = exception => {
	if (constants.environment === "production")
		Sentry.captureException(exception);
};

module.exports.captureEvent = event => {
	if (constants.environment === "production")
		Sentry.captureEvent(event);
};

module.exports.captureMessage = (message, level) => {
	if (constants.environment === "production")
		Sentry.captureMessage(message, level);
};
