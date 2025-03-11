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
app.use(express.static(path.join(__dirname, "src", "public")));

// Serve specific subfolders jika diperlukan
app.use(
  "/uploads/evidence/images",
  express.static(path.join(__dirname, "uploads/evidence/images"))
);
app.use(
  "/uploads/evidence/documents",
  express.static(path.join(__dirname, "uploads/evidence/documents"))
);
app.use(
  "/uploads/handling/images",
  express.static(path.join(__dirname, "uploads/handling/images"))
);
app.use(
  "/uploads/handling/documents",
  express.static(path.join(__dirname, "uploads/handling/documents"))
);

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ message: "Hello WBS" });
});

app.get("/privacy-policy", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
