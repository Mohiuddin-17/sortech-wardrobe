const { nanoid } = require("nanoid");
const prisma = require("../config/db");

async function createOutfit(req, res) {
  try {
    const { name, itemIds } = req.body;
    if (!name || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: "An outfit needs a name and at least one item." });
    }

    // Verify every item actually belongs to this user before linking it in.
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
    include: { items: { include: { clothingItem: true } } },
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

// Generates (or returns the existing) public share link for an outfit.
async function shareOutfit(req, res) {
  const outfit = await prisma.outfit.findUnique({ where: { id: req.params.id } });
  if (!outfit || outfit.userId !== req.user.id) {
    return res.status(404).json({ error: "Outfit not found." });
  }

  const shareToken = outfit.shareToken || nanoid(12);
  if (!outfit.shareToken) {
    await prisma.outfit.update({ where: { id: outfit.id }, data: { shareToken } });
  }

  res.json({ shareToken, shareUrl: `${process.env.FRONTEND_URL || ""}/shared/${shareToken}` });
}

// Public endpoint — no auth. Only returns the outfit's own items, never
// anything else about the owning user (their wardrobe stays private).
async function getSharedOutfit(req, res) {
  const outfit = await prisma.outfit.findUnique({
    where: { shareToken: req.params.token },
    include: {
      items: { include: { clothingItem: true } },
      user: { select: { name: true } },
    },
  });
  if (!outfit) return res.status(404).json({ error: "This share link is invalid or expired." });

  res.json({
    name: outfit.name,
    sharedBy: outfit.user.name,
    items: outfit.items.map((i) => ({
      name: i.clothingItem.name,
      category: i.clothingItem.category,
      imageUrl: i.clothingItem.imageUrl,
    })),
  });
}

module.exports = { createOutfit, listOutfits, deleteOutfit, shareOutfit, getSharedOutfit };
