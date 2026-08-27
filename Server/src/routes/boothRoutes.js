import express from "express";
import BoothSale from "../Models/BoothSale.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};

    const rows = await BoothSale.find(filter).sort({ date: -1 });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { date, amount, litres, paid = true, note = "" } = req.body;
    const safeAmount = Number(amount);
    const safeLitres =
      litres === "" || litres === null || litres === undefined
        ? null
        : Number(litres);

    if (!date || !Number.isFinite(safeAmount) || safeAmount < 0) {
      return res.status(400).json({
        message: "Date and a valid booth amount are required",
      });
    }

    if (safeLitres !== null && (!Number.isFinite(safeLitres) || safeLitres < 0)) {
      return res.status(400).json({ message: "Invalid booth litres" });
    }

    const booth = await BoothSale.findOneAndUpdate(
      { date },
      {
        date,
        amount: safeAmount,
        litres: safeLitres,
        paid: Boolean(paid),
        note,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    res.json(booth);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const booth = await BoothSale.findByIdAndDelete(req.params.id);

    if (!booth) {
      return res.status(404).json({ message: "Booth sale not found" });
    }

    res.json({ message: "Booth sale deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
