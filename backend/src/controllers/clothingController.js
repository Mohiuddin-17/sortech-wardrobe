const prisma = require("../config/db");
const { cloudinary } = require("../utils/cloudinary");

const CATEGORIES = [
  "TSHIRT", "SHIRT", "JEANS", "TROUSER", "PANTS",
  "SHOES", "SANDALS", "JACKET", "KURTA", "SHALWAR_KAMEEZ",
  "ACCESSORY", "OTHER",
];
const STYLES = ["FORMAL", "INFORMAL"];

const MAX_ITEMS_PER_USER = 50; // matches the "at least 50 items per user" free-tier target

async function addItem(req, res) {
  try {
    const { name, category, style, costAmount, currency } = req.body;

    if (!name || !category || !style) {
      return res.status(400).json({ error: "Name, category and style are required." });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(", ")}` });
    }
    if (!STYLES.includes(style)) {
      return res.status(400).json({ error: `Style must be one of: ${STYLES.join(", ")}` });
    }
    if (!req.file) {
      return res.status(400).json({ error: "A photo of the clothing item is required." });
    }

    const count = await prisma.clothingItem.count({ where: { userId: req.user.id } });
    if (count >= MAX_ITEMS_PER_USER) {
      return res.status(400).json({
        error: `You've reached the ${MAX_ITEMS_PER_USER}-item limit for this plan. Remove an item to add a new one.`,
      });
    }

    const item = await prisma.clothingItem.create({
      data: {
        userId: req.user.id,
        name,
        category,
        style,
        imageUrl: req.file.path,
        imageId: req.file.filename, // cloudinary public_id
        costCents: costAmount ? Math.round(parseFloat(costAmount) * 100) : null,
        currency: currency || "PKR",
      },
    });

    res.status(201).json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save this item. Please try again." });
  }
}

async function listItems(req, res) {
  const { category, style } = req.query;
  const where = { userId: req.user.id };
  if (category) where.category = category;
  if (style) where.style = style;

  const items = await prisma.clothingItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json({ items });
}

async function deleteItem(req, res) {
  try {
    const item = await prisma.clothingItem.findUnique({ where: { id: req.params.id } });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: "Item not found." });
    }

    if (item.imageId) {
      await cloudinary.uploader.destroy(item.imageId).catch(() => null);
    }
    await prisma.clothingItem.delete({ where: { id: item.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete this item." });
  }
}

// Powers the "how many T-shirts / pants / etc. do I have" section
async function stats(req, res) {
  const items = await prisma.clothingItem.findMany({ where: { userId: req.user.id } });

  const byCategory = {};
  const byStyle = { FORMAL: 0, INFORMAL: 0 };
  let totalCents = 0;
  let itemsWithCost = 0;

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    byStyle[item.style] += 1;
    if (item.costCents != null) {
      totalCents += item.costCents;
      itemsWithCost += 1;
    }
  }

  res.json({
    totalItems: items.length,
    limit: MAX_ITEMS_PER_USER,
    byCategory,
    byStyle,
    totalWorth: totalCents / 100,
    itemsWithCost,
    currency: items[0]?.currency || "PKR",
  });
}

module.exports = { addItem, listItems, deleteItem, stats, CATEGORIES, STYLES };
