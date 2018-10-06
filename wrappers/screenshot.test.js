const screenshot = require("./screenshot");

test("screenshot should return the right url", () => {
	return screenshot
		.promise({ url: "https://google.com" })
		.then(data => expect(data).toEqual("https://i.imgur.com/thgm6fR.png"));
});
