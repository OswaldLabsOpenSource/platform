const CronJob = require("cron").CronJob;

module.exports = () => {
	new CronJob("* * * * *", () => {
		require("./minute")();
		console.log("Running cron", "minute", new Date());
	}).start();
	new CronJob("0 * * * *", () => {
		require("./hour")();
		console.log("Running cron", "hour", new Date());
	}).start();
	new CronJob("0 0 * * *", () => {
		require("./day")();
		console.log("Running cron", "day", new Date());
	}).start();
	new CronJob("0 0 * * 1", () => {
		require("./week")();
		console.log("Running cron", "week", new Date());
	}).start();
};
