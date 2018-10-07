const axios = require("axios");

const weather = params =>
	new Promise((resolve, reject) => {
		axios
			.get(
				`https://api.openweathermap.org/data/2.5/weather?lat=${params.lat}&lon=${params.lng}&APPID=${
					process.env.OPENWEATHERMAP
				}`
			)
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				reject({ success: false, error: error.response.data.error });
			});
	});

module.exports.api = "weather";
module.exports.promise = weather;
module.exports.responder = (req, res) => {
	weather(req.params)
		.then(r => {
			res.json(r);
		})
		.catch(e => res.json(e));
};
