const Sentry = require("@sentry/node");

module.exports.init = () => {
	Sentry.init({ dsn: "https://958692a6eb8a409abbd72fd22298c03c@sentry.io/1254255" });
};

module.exports.captureException = exception => {
	Sentry.captureException(exception);
};

module.exports.captureEvent = event => {
	Sentry.captureEvent(event);
};

module.exports.captureMessage = (message, level) => {
	Sentry.captureMessage(message, level);
};
