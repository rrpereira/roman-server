const express = require("express");

const app = express();

app.use("/", require("./server/routes/router"));

module.exports = app;
