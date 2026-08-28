const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getFleet,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getRentals,
  updateRentalStatus,
} = require("../controllers/adminController");

// Every route below requires a valid admin token (Authorization: Bearer <token>)
router.use(protect);

router.get("/fleet", getFleet);
router.post("/fleet", createVehicle);
router.put("/fleet/:id", updateVehicle);
router.delete("/fleet/:id", deleteVehicle);

router.get("/rentals", getRentals);
router.patch("/rentals/:id/status", updateRentalStatus);

module.exports = router;
