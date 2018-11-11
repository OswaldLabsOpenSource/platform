const uncached = ["weather"];

module.exports = (req, res, api) => {
	// const client = require("redis").createClient(process.env.REDIS_URL);
	// client.on("error", error => new Error(error));
	// const key = `${api.api}/${JSON.stringify(req.params)}`;
	// console.log("Cached key", key);
	// client.get(key, (error, reply) => {
	// 	if (reply && !uncached.includes(api.api)) {
	// 		return res.json(JSON.parse(reply));
	// 	} else {
			api.promise(Object.values(req.params).length ? req.params : req.body)
				.then(r => {
					if (r.redirectUri) {
						res.redirect(r.redirectUri);
					} else {
						res.json(r);
					}
					// client.set(key, JSON.stringify(r));
				})
				.catch(e => {
					try {
						res.json(e);
					} catch (e) {}
				});
		// }
	// });
};
