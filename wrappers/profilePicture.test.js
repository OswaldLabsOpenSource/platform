const profilePicture = require("./profilePicture");

test("should return correct profile picture", () => {
	return profilePicture
		.promise({ email: "sample@example.com" })
		.then(data =>
			expect(JSON.stringify(data)).toEqual(
				"{\"redirectUri\":\"https://secure.gravatar.com/avatar/45e67126a4c44c6ae030279e21437c79?d=https%3A%2F%2Fui-avatars.com%2Fapi%2F/sample@example.com/128\"}"
			)
		);
});
