const express = require("express");
const { getSharedOutfit } = require("../controllers/outfitController");
const router = express.Router();

router.get("/:token", getSharedOutfit);

module.exports = router;
