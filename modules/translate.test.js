const translate = require("./translate");

test("translate hello world to french", () => {
	return translate
		.promise({ to: "fr", q: "Hello, world!" })
		.then(data =>
			expect(JSON.stringify(data)).toEqual(
				'{"text":"Bonjour le monde!","from":{"language":{"didYouMean":false,"iso":"en"},"text":{"autoCorrected":false,"value":"","didYouMean":false}},"raw":""}'
			)
		);
});
