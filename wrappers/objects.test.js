const objects = require("./objects");

test("should correctly detect object", () => {
	return objects
		.promise({
			dataUri:
				"data:image/jpeg;base64,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"
		})
		.then(data => expect(data.labels[0].Name).toEqual("Building"));
});
