const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: "your@email.com" }, // ← change this
    data: { role: "ADMIN" },
  });
  console.log("Done:", user.name, "is now ADMIN");
}

main().then(() => process.exit(0)).catch(console.error);