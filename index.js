require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const brute = require("express-brute");
const store = new brute.MemoryStore();
const bruteforce = new brute(store);
const crons = require("./crons");

const app = express();
crons();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.enable("trust proxy");

const limiter = new rateLimit({
	windowMs: 60000,
	max: 200,
	delayMs: 0
});
app.use(limiter);

const speedLimiter = slowDown({
	windowMs: 900000, // 15 minutes
	delayAfter: 1000,
	delayMs: 100
});
app.use(speedLimiter);

app.get("/", (req, res) => {
	res.json({
		info: ["https://github.com/OswaldLabsOpenSource/platform", "https://oswaldlabs.com/platform"]
	});
});

app.get("/data", (req, res) => require("./services/data")(req, res));
app.get("/screenshot", (req, res) => require("./services/screenshot")(req, res));
app.get("/reader", (req, res) => require("./services/reader")(req, res));
app.post("/describe", (req, res) => require("./services/describe")(req, res));
app.post("/reader", (req, res) => require("./services/reader")(req, res));

app.get("/agastya/api-keys", (req, res) => require("./agastya/config").list(req, res));
app.get("/agastya/api-keys/:apiKey", (req, res) => require("./agastya/config").read(req, res));
app.patch("/agastya/api-keys/:apiKey", (req, res) => require("./agastya/config").update(req, res));
app.delete("/agastya/api-keys/:apiKey", (req, res) => require("./agastya/config").delete(req, res));
app.put("/agastya/api-keys", (req, res) => require("./agastya/config").create(req, res));

app.get("/agastya/gdpr/export.csv", bruteforce.prevent, (req, res) => require("./agastya/elastic").export(req, res));
app.get("/agastya/gdpr/export/:format", bruteforce.prevent, (req, res) => require("./agastya/elastic").export(req, res));
app.get("/agastya/gdpr/delete", bruteforce.prevent, (req, res) => require("./agastya/elastic").delete(req, res));
app.get("/agastya/analytics/quota", (req, res) => require("./agastya/elastic").quota(req, res));
app.post("/agastya/analytics/graphs", (req, res) => require("./agastya/elastic").graphs(req, res));
app.post("/agastya/analytics/sorted", (req, res) => require("./agastya/elastic").sorted(req, res));
app.post("/agastya/analytics/explore", (req, res) => require("./agastya/elastic").explore(req, res));
app.post("/agastya/analytics/recents", (req, res) => require("./agastya/elastic").recents(req, res));
app.post("/agastya/secure-collect", (req, res) => require("./agastya/track")(req, res));
app.post("/agastya/secure-collect/:apiKey", (req, res) => require("./agastya/track")(req, res));
app.post("/agastya/form/:apiKey", (req, res) => require("./agastya/form")(req, res));

app.get("/auth/details", (req, res) => require("./agastya/auth").details(req, res));
app.patch("/auth/details", (req, res) => require("./agastya/auth").update(req, res));
app.post("/auth/login", bruteforce.prevent, (req, res) => require("./agastya/auth").login(req, res));
app.post("/auth/register", bruteforce.prevent, (req, res) => require("./agastya/auth").register(req, res));
app.post("/auth/forgot", bruteforce.prevent, (req, res) => require("./agastya/auth").forgot(req, res));
app.post("/auth/reset", bruteforce.prevent, (req, res) => require("./agastya/auth").reset(req, res));

app.get("/billing/customer", (req, res) => require("./stripe").details(req, res));
app.get("/billing/plans", (req, res) => require("./stripe").plans(req, res));
app.get("/billing/cards", (req, res) => require("./stripe").cards(req, res));
app.patch("/billing/cards/:cardId", (req, res) => require("./stripe").updateCard(req, res));
app.delete("/billing/cards/:cardId", (req, res) => require("./stripe").cards(req, res));
app.get("/billing/invoices", (req, res) => require("./stripe").invoices(req, res));
app.get("/billing/subscriptions", (req, res) => require("./stripe").subscriptions(req, res));
app.put("/billing/subscriptions", (req, res) => require("./stripe").createSubscription(req, res));

app.all("*", (req, res) => {
	res.status(404).json({ error: "route not found" });
});

app.set("json spaces", 4);
app.listen(process.env.PORT || 3002);
