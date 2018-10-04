const ip = require("./ip");

test("8.8.8.8 ip should return google's details", () => {
	return ip
		.promise({ ip: "8.8.8.8" })
		.then(data =>
			expect(JSON.stringify(data)).toEqual(
				'{"ip":"8.8.8.8","hostname":"google-public-dns-a.google.com","city":"Mountain View","region":"California","country":"US","loc":"37.3860,-122.0840","postal":"94035","phone":"650","org":"AS15169 Google LLC"}'
			)
		);
});
