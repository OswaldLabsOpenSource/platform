const image = require("./image");

test("should return image of paris", () => {
	return image
		.promise({ q: "paris" })
		.then(data =>
			expect(data.url).toEqual(
				"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Flag_of_Paris_with_shield.svg/120px-Flag_of_Paris_with_shield.svg.png"
			)
		);
});
