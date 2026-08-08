const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  createOutfit,
  listOutfits,
  deleteOutfit,
  confirmWearing,
  getWearHistory,
  shareWithUser,
  getInbox,
  getUnreadCount,
} = require("../controllers/outfitController");

const router = express.Router();
router.use(requireAuth);

router.get("/", listOutfits);
router.post("/", createOutfit);
router.delete("/:id", deleteOutfit);
router.post("/:id/wear", confirmWearing);
router.post("/:id/share", shareWithUser);

router.get("/wear-history", getWearHistory);
router.get("/inbox", getInbox);
router.get("/inbox/unread", getUnreadCount);

module.exports = router;
