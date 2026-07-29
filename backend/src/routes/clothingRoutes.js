const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../utils/cloudinary");
const { addItem, listItems, deleteItem, stats } = require("../controllers/clothingController");

const router = express.Router();

router.use(requireAuth);

router.get("/", listItems);
router.get("/stats", stats);
router.post("/", upload.single("photo"), addItem);
router.delete("/:id", deleteItem);

module.exports = router;
