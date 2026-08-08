const prisma = require("../config/db");
const { sendOutfitSharedEmail } = require("../utils/email");

const FRONTEND_URL = process.env.FRONTEND_URL || "https://sortech-wardrobe-1.onrender.com";

// ── Outfit CRUD ──────────────────────────────────────────────────────────────

async function createOutfit(req, res) {
  try {
    const { name, itemIds } = req.body;
    if (!name || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: "An outfit needs a name and at least one item." });
    }

    const owned = await prisma.clothingItem.findMany({
      where: { id: { in: itemIds }, userId: req.user.id },
      select: { id: true },
    });
    if (owned.length !== itemIds.length) {
      return res.status(400).json({ error: "One or more items don't belong to you." });
    }

    const outfit = await prisma.outfit.create({
      data: {
        userId: req.user.id,
        name,
        items: { create: itemIds.map((clothingItemId) => ({ clothingItemId })) },
      },
      include: { items: { include: { clothingItem: true } } },
    });

    res.status(201).json({ outfit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create the outfit." });
  }
}

async function listOutfits(req, res) {
  const outfits = await prisma.outfit.findMany({
    where: { userId: req.user.id },
    include: {
      items: { include: { clothingItem: true } },
      wearLogs: { orderBy: { wornAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ outfits });
}

async function deleteOutfit(req, res) {
  const outfit = await prisma.outfit.findUnique({ where: { id: req.params.id } });
  if (!outfit || outfit.userId !== req.user.id) {
    return res.status(404).json({ error: "Outfit not found." });
  }
  await prisma.outfit.delete({ where: { id: outfit.id } });
  res.json({ success: true });
}

// ── Wear log ─────────────────────────────────────────────────────────────────

async function confirmWearing(req, res) {
  try {
    const { occasion, notes } = req.body;
    const outfit = await prisma.outfit.findUnique({ where: { id: req.params.id } });
    if (!outfit || outfit.userId !== req.user.id) {
      return res.status(404).json({ error: "Outfit not found." });
    }

    const log = await prisma.wearLog.create({
      data: {
        userId: req.user.id,
        outfitId: outfit.id,
        occasion: occasion || null,
        notes: notes || null,
      },
    });

    res.status(201).json({ log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save wear log." });
  }
}

async function getWearHistory(req, res) {
  const logs = await prisma.wearLog.findMany({
    where: { userId: req.user.id },
    include: {
      outfit: {
        include: { items: { include: { clothingItem: true } } },
      },
    },
    orderBy: { wornAt: "desc" },
  });
  res.json({ logs });
}

// ── In-app sharing ────────────────────────────────────────────────────────────

async function shareWithUser(req, res) {
  try {
    const { toEmail, message } = req.body;
    if (!toEmail) return res.status(400).json({ error: "Recipient email is required." });

    const outfit = await prisma.outfit.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { clothingItem: true } } },
    });
    if (!outfit || outfit.userId !== req.user.id) {
      return res.status(404).json({ error: "Outfit not found." });
    }

    const toUser = await prisma.user.findUnique({ where: { email: toEmail.toLowerCase() } });
    if (!toUser) {
      return res.status(404).json({ error: "No user found with that email. They need to sign up first." });
    }
    if (toUser.id === req.user.id) {
      return res.status(400).json({ error: "You can't share an outfit with yourself." });
    }

    // Upsert — re-sharing the same outfit to the same person just updates the message
    const share = await prisma.outfitShare.upsert({
      where: { outfitId_toUserId: { outfitId: outfit.id, toUserId: toUser.id } },
      update: { message: message || null, seenAt: null, createdAt: new Date() },
      create: {
        outfitId: outfit.id,
        fromUserId: req.user.id,
        toUserId: toUser.id,
        message: message || null,
      },
    });

    // Fire email notification (non-blocking — don't fail the request if email fails)
    sendOutfitSharedEmail({
      toEmail: toUser.email,
      toName: toUser.name,
      fromName: req.user.name || "Someone",
      outfitName: outfit.name,
      appUrl: FRONTEND_URL,
      message,
    }).catch((err) => console.error("Email send failed:", err));

    res.status(201).json({ share });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not share outfit." });
  }
}

// Inbox — outfits shared with the logged-in user
async function getInbox(req, res) {
  const shares = await prisma.outfitShare.findMany({
    where: { toUserId: req.user.id },
    include: {
      outfit: { include: { items: { include: { clothingItem: true } } } },
      fromUser: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Mark all as seen
  await prisma.outfitShare.updateMany({
    where: { toUserId: req.user.id, seenAt: null },
    data: { seenAt: new Date() },
  });

  res.json({ shares });
}

// Unread count for the notification badge
async function getUnreadCount(req, res) {
  const count = await prisma.outfitShare.count({
    where: { toUserId: req.user.id, seenAt: null },
  });
  res.json({ count });
}

module.exports = {
  createOutfit,
  listOutfits,
  deleteOutfit,
  confirmWearing,
  getWearHistory,
  shareWithUser,
  getInbox,
  getUnreadCount,
};
