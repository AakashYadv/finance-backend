const express = require("express");
const router = express.Router();
const { listUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/usersController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);
router.get("/", authorize("admin", "analyst"), listUsers);
router.get("/:id", authorize("admin", "analyst"), getUser);
router.post("/", authorize("admin"), createUser);
router.patch("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
