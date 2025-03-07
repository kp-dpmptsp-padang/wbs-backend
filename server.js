require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const port = process.env.PORT || 3000;
const app = express();
const routes = require("./src/routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "Hello WBS" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
