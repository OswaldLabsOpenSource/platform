const express = require("express");
const cors = require("cors");
const ga = require("node-ga");
const RateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());
app.use(cors());
app.enable("trust proxy");
app.use(
	ga("UA-79176349-10", {
		cookie_name: "oswald_labs_platform"
	})
);

const limiter = new RateLimit({
	windowMs: 60 * 1000,
	max: 30,
	delayMs: 0
});
app.use(limiter);

app.get("/", (req, res) => {
	const icons = require("./icons.json");
	const illustrations = [];
	for (icon in icons) illustrations.push(slugify(icon, { lower: true }) + ".svg");
	res.json({ illustrations });
});

app.set("json spaces", 4);
app.listen(process.env.PORT || 3001, () => console.log("Platform running!"));
