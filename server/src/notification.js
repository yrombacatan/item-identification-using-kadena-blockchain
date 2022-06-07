const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");

const route = express.Router();

const schema = new mongoose.Schema({
  item_id: {
    type: String,
    required: true,
  },
  account_address: {
    type: String,
    required: true,
  },
  seen: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const joiSchema = Joi.object({
  item_id: Joi.string().required(),
  account_address: Joi.string().required(),
});

const Notification = mongoose.model("Notification", schema);

// index
route.get("/", async (req, res) => {
  try {
    const data = await Notification.find();
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
    const notification = await new Notification(value);
    const data = await notification.save();

    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// find
route.get("/find", async (req, res) => {
  if (req.body.account_address == null)
    return res.status(401).send("Account address is required");

  try {
    const data = await Notification.find({
      account_address: req.body.account_address,
      seen: false,
    });
    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// update
route.put("/", async (req, res) => {
  if (req.body.id == null) return res.status(401).send("Id is required");

  try {
    const data = await Notification.findByIdAndUpdate(req.body.id, {
      seen: true,
    });

    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// mark all as read
route.put("/update-all", async (req, res) => {
  if (req.body.account_address == null)
    return res.status(401).send("Account address is required");

  try {
    const data = await Notification.updateMany(
      { account_address: req.body.account_address, seen: false },
      {
        seen: true,
      }
    );

    return res.send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = route;
