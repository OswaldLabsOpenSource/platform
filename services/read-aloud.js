const axios = require("axios");
const md5 = require("md5");
const fs = require("fs");
const path = require("path");
const constants = require("../constants");
const sentry = require("../sentry");
sentry.init();

module.exports = (req, res) => {
	const language = req.query.voice || "en-US-Wavenet-F";
	const filePath = path.join(__dirname, "..", "cache", "read-aloud", md5(req.query.text + language) + ".mp3");
	fs.exists(filePath, exists => {
		if (!exists) {
			axios({
				method: "POST",
				url: `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${constants.google}`,
				data: {
					input: {
						text: req.query.text
					},
					voice: {
						languageCode: language.substring(0, 5),
						name: language
					},
					audioConfig: {
						audioEncoding: "MP3",
						pitch: 0.0,
						speakingRate: 1.0
					}
				}
			})
				.then(response => {
					if (!response.data || !response.data.audioContent) return res.status(500).json({ error: true });
					fs.writeFile(filePath, Buffer.from(response.data.audioContent, "base64"), () => {
						res.sendFile(filePath);
					});
				})
				.catch(() => res.status(500).json({ error: true }));
		} else {
			res.sendFile(filePath);
		}
	});
};
