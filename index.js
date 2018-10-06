require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ua = require("universal-analytics");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

const app = express();
app.use(express.json());
app.use(cors());
app.enable("trust proxy");
process.env.USER !== "anandchowdhary" && app.use(ua.middleware("UA-79176349-10", { cookieName: "oswald_labs_platform" }));

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

// Public endpoints
app.get("/v1/ip/:ip", (req, res) => require("./wrappers/ip").responder(req, res));
app.get("/v1/reader/:url", (req, res) => require("./wrappers/reader").responder(req, res));
app.post("/v1/objects", (req, res) => require("./wrappers/objects").responder(req, res));
app.get("/v1/geocode/:lat/:lng", (req, res) => require("./wrappers/geocode").responder(req, res));
app.get("/v1/translate/:to/:q", (req, res) => require("./wrappers/translate").responder(req, res));
app.get("/v1/image/:q", (req, res) => require("./wrappers/image").responder(req, res));

// Secured endpoints
const secure = require("./secure");
app.post("/secure/generate", (req, res) => secure.generate(req, res));
app.get("/secure/ip/:ip", (req, res) => secure.respond(req, res, require("./wrappers/ip")));
app.get("/secure/reader/:url", (req, res) => secure.respond(req, res, require("./wrappers/reader")));
app.post("/secure/objects", (req, res) => secure.respond(req, res, require("./wrappers/objects")));
app.get("/secure/geocode/:lat/:lng", (req, res) => secure.respond(req, res, require("./wrappers/geocode")));
app.get("/secure/translate/:to/:q", (req, res) => secure.respond(req, res, require("./wrappers/translate")));
app.get("/secure/image/:q", (req, res) => secure.respond(req, res, require("./wrappers/image")));

app.all("*", (req, res) => {
	res.status(404).json({ error: "route not found" });
});

app.set("json spaces", 4);
app.listen(process.env.PORT || 3002);
