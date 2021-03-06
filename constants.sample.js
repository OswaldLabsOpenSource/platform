module.exports = {
	environment: "development",
	secret: "jwt-secret-key",
	salt: "salt-for-hashing",
	encryptionKey: "encryption-key",
	stripe: "stripe-live-api-key",
	master: "hashed-master",
	azure: "azure-api-key",
	elastic: "elastic-search-endpoint.com",
	google: "google-cloud-api-key",
	ipinfo: "ipinfo-access-token",
	mysql: {
		host: "mysql-host",
		port: "mysql-port",
		user: "mysql-user",
		password: "mysql-password",
		database: "mysql-database"
	},
	mail: {
		email: "sample@example.com",
		password: "email-password"
	},
	aws: {
		access: "aws-access-key",
		secret: "aws-secret-key"
	},
	recaptcha: {
		site: "recaptcha-site-key",
		secret: "recaptcha-secret-key"
	}
};
