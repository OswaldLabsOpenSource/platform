const axios = require("axios");
const crypto = require('crypto');

const profilePicture = params =>
	new Promise((resolve, reject) => {
		axios
			.get(`https://person.clearbit.com/v2/people/find?email=${params.email}&streaming=true`, {
				auth: {
					username: process.env.CLEARBIT,
					password: ""
				}
			})
			.then(response => {
				resolve({
					redirectUri: response.data.avatar || "https://secure.gravatar.com/avatar/" + crypto.createHash("md5").update(params.email).digest("hex") + `?d=https%3A%2F%2Fui-avatars.com%2Fapi%2F/${params.email}/128`
				});
				
			})
			.catch(error => {
				resolve({
					redirectUri: "https://secure.gravatar.com/avatar/" + crypto.createHash("md5").update(params.email).digest("hex") + `?d=https%3A%2F%2Fui-avatars.com%2Fapi%2F/${params.email}/128`
				});
			});
	});

module.exports.api = "profilePicture";
module.exports.promise = profilePicture;