const mongoose = require("mongoose");

async function connectDatabase() {
  await mongoose.connect("mongodb://localhost:27017/item_identification");
}

module.exports = connectDatabase;
