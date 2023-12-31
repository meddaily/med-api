const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("./config");
require("dotenv").config();
const multer = require('multer');
const upload = multer();
const PORT = process.env.PORT || 443;
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Remove the following line, as it's not needed when handling form data
// app.use(bodyParser.json());
app.use(upload.any())
app.use(express.static("public"));
app.use("/images", express.static("images"));

// include routes
require("./app/Routes/Routes.js")(app);
require("./app/Routes/Adminroute.js")(app);

app.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});

app.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      message: "Welcome to Meddaily",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// check connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.listen(PORT, () => {
  console.log(`PORT Listening ${PORT}`);
});
