const express = require("express");
const router = express.Router();
const { listRecords, getRecord, createRecord, updateRecord, deleteRecord } = require("../controllers/recordsController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", authorize("viewer", "analyst", "admin"), listRecords);
router.get("/:id", authorize("viewer", "analyst", "admin"), getRecord);
router.post("/", authorize("analyst", "admin"), createRecord);
router.patch("/:id", authorize("admin"), updateRecord);
router.delete("/:id", authorize("admin"), deleteRecord);

module.exports = router;
