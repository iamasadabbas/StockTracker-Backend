const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const connectDB = require("./Config/dbconnection");
const path = require("path");
const app = express();

app.use("/images", express.static(path.join(__dirname, "images")));

const cors = require("cors");
mongoose.set("strictQuery", false);

const corsOptions = {
  origin: 'http://localhost:3001',
  credentials: true // Allow sending cookies
};
app.use(cors(corsOptions))

// app.use(
//   cors({
//     methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
//   })
// );
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(cors('http://localhost:3001'));

require("dotenv").config();

//uncaught exception

process.on("uncaughtException", (err) => {
  console.log(`Error:${err.message}`);
  console.log("shutting down the server due to uncaught exception");
  process.exit(1);
});

const db = connectDB();

app.use(express.json());
app.use(cookieParser());

// Routes

const user = require("./routes/userRouter");
const product = require("./routes/productRouter");
const request = require("./routes/requestRouter");
const notification = require("./routes/notificationRouter");

app.use("/user", user);
app.use("/product", product);
app.use("/request", request);
app.use("/notification", notification);

//middleware
app.use(errorMiddleware);

module.exports = db;

const server = app.listen(3000 || process.env.PORT, function () {
  console.log("server started on port 3000");
});

//unhandle promise rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error:${err.message}`);
  console.log("shutting down the server due to unhandle promis Rejection");

  server.close(() => {
    process.exit(1);
  });
});
