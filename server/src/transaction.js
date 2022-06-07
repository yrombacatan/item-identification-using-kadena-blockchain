const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");

const route = express.Router();

const schema = new mongoose.Schema({
  item_id: {
    type: String,
    required: true,
  },
  request_key: {
    type: String,
    required: true,
  },
  gas: {
    type: Number,
    required: true,
  },
  meta_data: {
    type: Object,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    default: "",
    required: false,
  },
  event: {
    type: String,
    required: true,
  },
});

const joiSchema = Joi.object({
  item_id: Joi.string().required(),
  request_key: Joi.string().required(),
  gas: Joi.number().required(),
  meta_data: Joi.object().required(),
  from: Joi.string().required(),
  to: Joi.string(),
  event: Joi.string().required(),
});

const Transaction = mongoose.model("Transaction", schema);

// index
route.get("/", async (req, res) => {
  try {
    const data = await Transaction.find();
    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// create
route.post("/", async (req, res) => {
  const { error, value } = joiSchema.validate(req.body);

  if (error) return res.status(401).send(error);

  try {
    const transaction = await new Transaction(value);
    const data = await transaction.save();

    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = route;
