const express = require("express");
const growthController = require("../controllers/growthController");

const router = express.Router();

router.post("/apply-action", growthController.applyAction);
router.get("/", growthController.getGrowth);

module.exports = router;
