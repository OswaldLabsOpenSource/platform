const constants = require("../constants");
const stripe = require("stripe")(constants.stripe);

module.exports = stripe;
