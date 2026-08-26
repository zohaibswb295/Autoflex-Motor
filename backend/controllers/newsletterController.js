const Newsletter = require("../models/Newsletter");

// POST /api/newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: "Already subscribed" });
    }
    const sub = await Newsletter.create({ email });
    res.status(201).json({ success: true, data: sub });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
