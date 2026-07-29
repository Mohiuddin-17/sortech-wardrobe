const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminOnly");
const { overview, listUsers, setRole } = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/overview", overview);
router.get("/users", listUsers);
router.patch("/users/:id/role", setRole);

module.exports = router;
