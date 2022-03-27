const express = require("express");
const route = express.Router();
const services = require("../services/services");

/**
 * @description Convert a number into a roman numeral or a range of numbers in the corresponding roman numerals.
 * @method GET /romannumeral
 */
route.get("/romannumeral", services.toRoman);

/**
 * @description Invalid routes.
 * @method GET *
 */
route.get("*", (req, res) => {
  res.status(404).json({ message: "Invalid route." });
});

module.exports = route;
