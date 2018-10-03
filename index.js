require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ga = require("node-ga");
const RateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());
app.use(cors());
app.enable("trust proxy");
process.env.USER !== "anandchowdhary" &&
	app.use(
		ga("UA-79176349-10", {
			cookie_name: "oswald_labs_platform"
		})
	);

const limiter = new RateLimit({
	windowMs: 60000,
	max: 100,
	delayMs: 0
});
app.use(limiter);

app.get("/", (req, res) => {
	res.json({ hello: "world" });
});
app.get("/ip/:ip", (req, res) => require("./wrappers/ip")(req, res));
app.post("/objects", (req, res) => require("./wrappers/objects")(req, res));
app.get("/geocode/:lat/:lng", (req, res) => require("./wrappers/geocode")(req, res));

app.set("json spaces", 4);
app.listen(process.env.PORT || 3002, () => console.log("Platform running!"));
