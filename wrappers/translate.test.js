const translate = require("./translate");

test("translate hello world to french", () => {
	return translate
		.promise({ to: "fr", q: "Hello, world! How are you?" })
		.then(data =>
			expect(JSON.stringify(data)).toEqual(
				'{"translatedText":"Bonjour le monde! Comment vas-tu?","detectedSourceLanguage":"en","originalText":"Hello, world! How are you?"}'
			)
		);
});
