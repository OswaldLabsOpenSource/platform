const nodemailer = require("nodemailer");
const constants = require("../constants");
const marked = require("marked");

const smtpConfig = {
	service: "Zoho",
	host: "smtp.zoho.com",
	port: 587,
	secure: false,
	auth: {
		user: constants.mail.email,
		pass: constants.mail.password
	},
	tls: { rejectUnauthorized: false }
};

module.exports = (config = {}, callback = () => {}) => {
	const message = {
		from: config.from || "Oswald Labs <" + constants.mail.email + ">",
		to: config.to || "anandchowdhary@gmail.com",
		subject: config.subject || "Sample Email from Nodemailer",
		text: config.text || "Plaintext version of the message",
		html: config.html || marked(config.text) || "<p>HTML version of the message</p>"
	};
	const transporter = nodemailer.createTransport(smtpConfig);
	transporter.sendMail(message, callback);
};
