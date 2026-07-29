const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  createOutfit,
  listOutfits,
  deleteOutfit,
  shareOutfit,
} = require("../controllers/outfitController");

const router = express.Router();

router.use(requireAuth);

router.get("/", listOutfits);
router.post("/", createOutfit);
router.delete("/:id", deleteOutfit);
router.post("/:id/share", shareOutfit);

module.exports = router;
