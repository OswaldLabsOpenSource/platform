const mongoose = require("mongoose");
module.exports = new mongoose.Schema({
	apiKey: String,
	owner: Number,
	plan: String,
	pageviews: { allowed: Number, consumed: Number, updatedAt: Date },
	domains: Array,
	settings: {
		bgColor: String,
		textColor: String,
		headingText: String,
		subheadingText: String,
		variables: {
			readAloudSelector: String
		},
		links: {
			privacyPolicy: String,
			cookiePolicy: String
		},
		bools: Array,
		integrations: {
			drift: String
		},
		pages: {
			"/": {
				meta: {
					title: String
				},
				cards: Array
			}
		}
	}
});
