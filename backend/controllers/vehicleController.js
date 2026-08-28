const Vehicle = require("../models/Vehicle");

// GET /api/vehicles?category=luxury&type=SUV&brand=Mercedes
exports.getVehicles = async (req, res) => {
  try {
    const { category, type, brand, minPrice, maxPrice } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/vehicles/:id
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: "Vehicle not found" });
    }
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/vehicles  (used by the admin panel)
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT /api/vehicles/:id  (used by the admin panel)
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) {
      return res.status(404).json({ success: false, error: "Vehicle not found" });
    }
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE /api/vehicles/:id  (used by the admin panel)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: "Vehicle not found" });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
