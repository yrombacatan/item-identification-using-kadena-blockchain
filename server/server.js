const express = require("express");
const cors = require("cors");
const connectDatabase = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const notificationRouter = require("./src/notification");
const transactionRouter = require("./src/transaction");

connectDatabase().catch((err) => console.log(err));

app.use("/api/notification", notificationRouter);
app.use("/api/transaction", transactionRouter);

app.listen("3001", () => {
  console.log("App is running on port 3001");
});
