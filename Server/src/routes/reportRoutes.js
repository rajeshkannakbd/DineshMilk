import express from "express";
import Delivery from "../Models/Delivery.js";
import OccasionalSale from "../Models/OccasionalSale.js";
import BoothSale from "../Models/BoothSale.js";
import Customer from "../Models/Customer.js";

const router = express.Router();

function emptySession() {
  return { litres: 0, amount: 0, delivered: 0, count: 0 };
}

function addPayment(target, row) {
  if (row.paid) target.paid += row.amount;
  else target.pending += row.amount;
}

function addSale(target, row) {
  target.litres += Number(row.litres || 0);
  target.amount += Number(row.amount || 0);
  addPayment(target, row);
}

router.get("/daily", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const [deliveries, occasionalSales, booth] = await Promise.all([
      Delivery.find({ date }).populate("customerId"),
      OccasionalSale.find({ date }).populate("customerId"),
      BoothSale.findOne({ date }),
    ]);

    const result = {
      date,
      morning: emptySession(),
      evening: emptySession(),
      occasional: {
        litres: 0,
        amount: 0,
        paid: 0,
        pending: 0,
        count: 0,
      },
      booth: {
        litres: booth?.litres ?? null,
        amount: Number(booth?.amount || 0),
        paid: booth?.paid ? Number(booth.amount || 0) : 0,
        pending: booth && !booth.paid ? Number(booth.amount || 0) : 0,
        exists: Boolean(booth),
      },
      total: {
        litres: 0,
        amount: 0,
        paid: 0,
        pending: 0,
        delivered: 0,
      },
    };

    for (const row of deliveries) {
      const session = result[row.session];
      if (!session) continue;

      session.count += 1;
      if (row.delivered) {
        session.delivered += 1;
        session.litres += Number(row.litres || 0);
        session.amount += Number(row.amount || 0);

        result.total.litres += Number(row.litres || 0);
        result.total.amount += Number(row.amount || 0);
        result.total.delivered += 1;
        addPayment(result.total, row);
      }
    }

    for (const row of occasionalSales) {
      addSale(result.occasional, row);
      result.occasional.count += 1;

      result.total.litres += Number(row.litres || 0);
      result.total.amount += Number(row.amount || 0);
      addPayment(result.total, row);
    }

    // Booth sale is revenue/cash, but its litres are optional because the
    // user may not know the exact remaining quantity.
    if (booth) {
      result.total.amount += Number(booth.amount || 0);
      result.total.paid += booth.paid ? Number(booth.amount || 0) : 0;
      result.total.pending += !booth.paid ? Number(booth.amount || 0) : 0;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/monthly", async (req, res) => {
  try {
    const { month, customerId } = req.query;

    if (!month) {
      return res.status(400).json({ message: "month is required" });
    }

    const dateRegex = new RegExp(`^${month.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    const deliveryFilter = { date: { $regex: dateRegex } };
    const occasionalFilter = { date: { $regex: dateRegex } };

    if (customerId) {
      deliveryFilter.customerId = customerId;
      occasionalFilter.customerId = customerId;
    }

    const [deliveries, occasionalSales, customer] = await Promise.all([
      Delivery.find(deliveryFilter).sort({ date: 1 }),
      OccasionalSale.find(occasionalFilter).sort({ date: 1 }),
      customerId ? Customer.findById(customerId) : Promise.resolve(null),
    ]);

    if (customerId && !customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const summary = {
      litres: 0,
      amount: 0,
      paid: 0,
      pending: 0,
      morningLitres: 0,
      eveningLitres: 0,
      occasionalLitres: 0,
      regularAmount: 0,
      occasionalAmount: 0,
      deliveryDays: 0,
      occasionalCount: occasionalSales.length,
    };

    const dayMap = new Map();

    for (const row of deliveries) {
      if (!row.delivered) continue;

      const litres = Number(row.litres || 0);
      const amount = Number(row.amount || 0);
      summary.litres += litres;
      summary.amount += amount;
      summary.regularAmount += amount;

      if (row.session === "morning") summary.morningLitres += litres;
      if (row.session === "evening") summary.eveningLitres += litres;

      if (row.paid) summary.paid += amount;
      else summary.pending += amount;

      if (!dayMap.has(row.date)) {
        dayMap.set(row.date, {
          date: row.date,
          morningLitres: 0,
          eveningLitres: 0,
          occasionalLitres: 0,
          litres: 0,
          amount: 0,
          paid: 0,
          pending: 0,
        });
      }

      const day = dayMap.get(row.date);
      day.litres += litres;
      day.amount += amount;
      if (row.session === "morning") day.morningLitres += litres;
      if (row.session === "evening") day.eveningLitres += litres;
      if (row.paid) day.paid += amount;
      else day.pending += amount;
    }

    for (const row of occasionalSales) {
      const litres = Number(row.litres || 0);
      const amount = Number(row.amount || 0);
      summary.litres += litres;
      summary.amount += amount;
      summary.occasionalLitres += litres;
      summary.occasionalAmount += amount;

      if (row.paid) summary.paid += amount;
      else summary.pending += amount;

      if (!dayMap.has(row.date)) {
        dayMap.set(row.date, {
          date: row.date,
          morningLitres: 0,
          eveningLitres: 0,
          occasionalLitres: 0,
          litres: 0,
          amount: 0,
          paid: 0,
          pending: 0,
        });
      }

      const day = dayMap.get(row.date);
      day.litres += litres;
      day.occasionalLitres += litres;
      day.amount += amount;
      if (row.paid) day.paid += amount;
      else day.pending += amount;
    }

    summary.deliveryDays = [...dayMap.values()].filter(
      (day) => day.litres > 0,
    ).length;

    res.json({
      month,
      customer,
      summary,
      days: [...dayMap.values()],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/customer-history/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const [deliveries, occasionalSales] = await Promise.all([
      Delivery.find({ customerId, delivered: true }).sort({ date: -1 }),
      OccasionalSale.find({ customerId }).sort({ date: -1 }),
    ]);

    const months = new Map();

    const getMonth = (date) => date.slice(0, 7);

    for (const row of deliveries) {
      const month = getMonth(row.date);
      if (!months.has(month)) {
        months.set(month, {
          month,
          litres: 0,
          amount: 0,
          paid: 0,
          pending: 0,
          morningLitres: 0,
          eveningLitres: 0,
          occasionalLitres: 0,
        });
      }

      const item = months.get(month);
      const litres = Number(row.litres || 0);
      const amount = Number(row.amount || 0);
      item.litres += litres;
      item.amount += amount;
      if (row.session === "morning") item.morningLitres += litres;
      if (row.session === "evening") item.eveningLitres += litres;
      if (row.paid) item.paid += amount;
      else item.pending += amount;
    }

    for (const row of occasionalSales) {
      const month = getMonth(row.date);
      if (!months.has(month)) {
        months.set(month, {
          month,
          litres: 0,
          amount: 0,
          paid: 0,
          pending: 0,
          morningLitres: 0,
          eveningLitres: 0,
          occasionalLitres: 0,
        });
      }

      const item = months.get(month);
      const litres = Number(row.litres || 0);
      const amount = Number(row.amount || 0);
      item.litres += litres;
      item.amount += amount;
      item.occasionalLitres += litres;
      if (row.paid) item.paid += amount;
      else item.pending += amount;
    }

    const history = [...months.values()].sort((a, b) =>
      b.month.localeCompare(a.month),
    );

    res.json({ customer, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
