require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.enable("trust proxy");

const limiter = new rateLimit({
	windowMs: 60000,
	max: 100,
	delayMs: 0
});
app.use(limiter);

const speedLimiter = slowDown({
	windowMs: 900000,
	delayAfter: 500,
	delayMs: 500
});
app.use(speedLimiter);

app.get("/", (req, res) => {
	res.json({
		info: ["https://github.com/OswaldLabsOpenSource/platform", "https://oswaldlabs.com/platform"]
	});
});

app.get("/screenshot", (req, res) => require("./services/screenshot")(req, res));

app.get("/agastya/config/:apiKey", (req, res) => require("./agastya/config").read(req, res));

app.all("*", (req, res) => {
	res.status(404).json({ error: "route not found" });
});

app.set("json spaces", 4);
app.listen(process.env.PORT || 3002);
