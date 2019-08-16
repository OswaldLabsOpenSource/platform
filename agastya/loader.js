const script = `/**
 * IMPORTANT UPGRADE NOTICE
 * ========================
 * 
 * If you're setting this, you're still using the old Agastya loader.
 * 
 * Starting September 2019, we'll start to show a console.warn message on your site if you still haven't
 * migrated to the new loader. We promise this is the last time you'll have to migrate. :)
 * 
 * <script src="https://platform-beta.oswaldlabs.com/v1/agastya/load/YOUR_API_KEY.js" async defer></script>
 */
var script = document.getElementById("agastyascript");
var url = "https://platform-beta.oswaldlabs.com/v1/agastya/load/__KEY__.js";
var s = document.createElement("script");
s.setAttribute("src", url);
var elt = document.body || document.head || document.documentElement;
if (elt)
  elt.appendChild(s);
`;

module.exports.development = (req, res) => {
	const send = script.replace(/__KEY__/g, req.params.apiKey.replace(".js", "")).replace(/__ENVIRONMENT__/g, "development");
	res.type("js")
		.set({
			"Cache-Control": "no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
		})
		.send(send);
};

module.exports.acceptance = (req, res) => {
	const send = script.replace(/__KEY__/g, req.params.apiKey.replace(".js", "")).replace(/__ENVIRONMENT__/g, "acceptance");
	res.type("js")
		.set({
			"Cache-Control": "public, max-age=3600"
		})
		.send(send);
};

module.exports.production = (req, res) => {
	const send = script.replace(/__KEY__/g, req.params.apiKey.replace(".js", "")).replace(/__ENVIRONMENT__/g, "production");
	res.type("js")
		.set({
			"Cache-Control": "public, max-age=86400"
		})
		.send(send);
};
