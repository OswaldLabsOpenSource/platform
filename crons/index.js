const CronJob = require("cron").CronJob;

module.exports = () => {
	new CronJob("* * * * *", () => {
		require("./minute")();
	}).start();
	new CronJob("0 * * * *", () => {
		require("./hour")();
	}).start();
	new CronJob("0 0 * * *", () => {
		require("./day")();
	}).start();
	new CronJob("0 0 * * 1", () => {
		require("./week")();
	}).start();
};
