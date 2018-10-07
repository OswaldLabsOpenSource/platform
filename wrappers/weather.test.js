const weather = require("./weather");

test("should return correct weather", () => {
	return weather.promise({ lat: 42, lng: 41 }).then(data => expect(data.name).toEqual("Poti"));
});
