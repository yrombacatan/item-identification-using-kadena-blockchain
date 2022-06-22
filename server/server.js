const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDatabase = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "client", "build")));

const notificationRouter = require("./src/notification");
const transactionRouter = require("./src/transaction");

connectDatabase().catch((err) => console.log(err));

app.use("/api/notification", notificationRouter);
app.use("/api/transaction", transactionRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(process.env.PORT || 3001, () => {
  console.log("App is running now!");
});
