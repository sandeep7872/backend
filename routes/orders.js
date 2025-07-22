const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ success: true, message: "Order saved" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

module.exports = router;
