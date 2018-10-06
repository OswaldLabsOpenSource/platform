const geocode = require("./geocode");

test("geocode should return the right plus code", () => {
	return geocode
		.promise({ lat: "40.714224", lng: "-73.961451" })
		.then(data => expect(data.plus_code.global_code).toEqual("87G8P27Q+MC"));
});
