const app = require("./app.js");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 5000; //uses config.env port if available, otherwise uses 5000

app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is runnning on http://localhost:${PORT}`);
});
