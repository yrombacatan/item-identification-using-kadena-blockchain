const mongoose = require("mongoose");
require("dotenv").config();

async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB);
}

module.exports = connectDatabase;
