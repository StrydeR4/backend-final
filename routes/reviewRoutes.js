const express = require("express");
const c = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.get("/", c.getForProduct);
router.post("/", auth, c.createForProduct);
router.put("/:reviewId", auth, c.update);
router.delete("/:reviewId", auth, c.remove);

module.exports = router;

