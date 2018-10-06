const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const image = params =>
	new Promise((resolve, reject) => {
		axios
			.get(`https://commons.wikimedia.org/wiki/${params.q}`)
			.then(response => {
				const dom = new JSDOM(response.data);
				if (dom.window.document.querySelectorAll(".gallery .image img").length) {
					resolve({ url: dom.window.document.querySelector(".gallery .image img").getAttribute("src") });
				} else {
					throw new Error();
				}
			})
			.catch(() => {
				axios
					.get(`https://commons.wikimedia.org/w/index.php?title=Special:Search&fulltext=1&search=${params.q}`)
					.then(response => {
						const dom = new JSDOM(response.data);
						if (dom.window.document.querySelectorAll(".mw-search-result img").length) {
							resolve({ url: dom.window.document.querySelector(".mw-search-result img").getAttribute("src") });
						} else {
							resolve({ url: "https://tse2.mm.bing.net/th?q=india&w=100&h=100&p=0&dpr=2&adlt=moderate&c=1" });
						}
					})
					.catch(error => {
						reject({ success: false, error: error.response ? error.response.data : error });
					});
			});
	});

module.exports.api = "image";
module.exports.promise = image;
module.exports.responder = (req, res) => {
	const client = require("redis").createClient(process.env.REDIS_URL);
	client.on("error", error => new Error(error));
	const key = `wrappers/image/${req.params.q}`;
	client.get(key, (error, reply) => {
		if (reply && process.env.USER !== "anandchowdhary") {
			return res.json(JSON.parse(reply));
		} else {
			image(req.params)
				.then(r => {
					res.redirect(r.url);
					client.set(key, JSON.stringify(r));
				})
				.catch(e => res.json(e));
		}
	});
};
