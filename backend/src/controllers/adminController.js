const prisma = require("../config/db");

// Everything here is intentionally aggregate-only. The admin (app creator)
// can see HOW MANY items each user has and basic account info, but never
// the clothing photos themselves — that's each user's private wardrobe.
async function overview(req, res) {
  const [userCount, itemCount, outfitCount] = await Promise.all([
    prisma.user.count(),
    prisma.clothingItem.count(),
    prisma.outfit.count(),
  ]);

  res.json({ userCount, itemCount, outfitCount });
}

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { clothingItems: true, outfits: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      itemCount: u._count.clothingItems,
      outfitCount: u._count.outfits,
    })),
  });
}

// Promote/demote a user. Guarded so an admin can't accidentally demote themselves
// and lock everyone out of the admin panel.
async function setRole(req, res) {
  const { role } = req.body;
  if (!["USER", "ADMIN"].includes(role)) {
    return res.status(400).json({ error: "Role must be USER or ADMIN." });
  }
  if (req.params.id === req.user.id && role !== "ADMIN") {
    return res.status(400).json({ error: "You can't remove your own admin access." });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ user });
}

module.exports = { overview, listUsers, setRole };
