import express from "express";
import OccasionalSale from "../Models/OccasionalSale.js";
import Customer from "../Models/Customer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};

    const rows = await OccasionalSale.find(filter)
      .populate("customerId")
      .sort({ createdAt: -1 });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      customerId,
      date,
      session = "morning",
      litres,
      pricePerLitre,
      paid = true,
      note = "",
    } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const safeLitres = Number(litres);
    const safePrice = Number(
      pricePerLitre ?? customer.pricePerLitre ?? 50,
    );

    if (!date || !Number.isFinite(safeLitres) || safeLitres <= 0) {
      return res.status(400).json({
        message: "Date and a valid litres value are required",
      });
    }

    if (!Number.isFinite(safePrice) || safePrice < 0) {
      return res.status(400).json({ message: "Invalid price per litre" });
    }

    const amount = safeLitres * safePrice;

    const sale = await OccasionalSale.create({
      customerId,
      date,
      session,
      litres: safeLitres,
      pricePerLitre: safePrice,
      amount,
      paid: Boolean(paid),
      note,
    });

    const populated = await sale.populate("customerId");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id/payment", async (req, res) => {
  try {
    const sale = await OccasionalSale.findByIdAndUpdate(
      req.params.id,
      { paid: Boolean(req.body.paid) },
      { new: true, runValidators: true },
    ).populate("customerId");

    if (!sale) {
      return res.status(404).json({ message: "Occasional sale not found" });
    }

    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const sale = await OccasionalSale.findByIdAndDelete(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Occasional sale not found" });
    }

    res.json({ message: "Occasional sale deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
