const Sentry = require("@sentry/node");

module.exports = () => {
    Sentry.init({ dsn: "https://958692a6eb8a409abbd72fd22298c03c@sentry.io/1254255" });
}
