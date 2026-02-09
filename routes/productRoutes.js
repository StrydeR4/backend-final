const express = require("express");
const c = require("../controllers/productController");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.get("/", c.getAll);
router.get("/:id", c.getOne);

router.post("/", auth, requireAdmin, c.create);
router.put("/:id", auth, requireAdmin, c.update);
router.delete("/:id", auth, requireAdmin, c.remove);

module.exports = router;
