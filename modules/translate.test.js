const translate = require("./translate");

test("translate hello world to french", () => {
	return translate
		.promise({ to: "fr", q: "Hello, world! How are you?" })
		.then(data =>
			expect(JSON.stringify(data)).toEqual(
				'{"translatedText": "Bonjour! Comment allez-vous?","detectedSourceLanguage": "en","originalText": "Good morning! How are you?"}'
			)
		);
});
