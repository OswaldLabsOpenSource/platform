require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const brute = require("express-brute");
const store = new brute.MemoryStore();
const bruteforce = new brute(store);

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

app.get("/auth/details", (req, res) => require("./agastya/auth").details(req, res));
app.patch("/auth/details", (req, res) => require("./agastya/auth").update(req, res));
app.post("/auth/login", (req, res) => require("./agastya/auth").login(req, res));
app.post("/auth/register", (req, res) => require("./agastya/auth").register(req, res));
app.post("/auth/forgot", (req, res) => require("./agastya/auth").forgot(req, res));
app.post("/auth/reset", (req, res) => require("./agastya/auth").reset(req, res));

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
