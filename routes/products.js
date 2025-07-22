const express = require("express");
const router = express.Router();
const { getPaginatedProducts } = require("../controllers/productController");

router.get("/", getPaginatedProducts);

module.exports = router;
