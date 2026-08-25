import express from "express";

import Delivery from "../models/Delivery.js";
import Customer from "../models/Customer.js";

const router = express.Router();


/*
GET DELIVERIES FOR A DATE

Example:

GET /api/deliveries?date=2026-08-24
*/
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    const deliveries = await Delivery
      .find({ date })
      .populate("customerId");

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


/*
MARK DELIVERY

This is the main operation.

One tap from frontend eventually comes here.
*/
router.post("/mark", async (req, res) => {
  try {
    const {
      customerId,
      date,
      session,
      litres,
      delivered,
      paid,
      note
    } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    const safeLitres = delivered
      ? Number(litres || 0)
      : 0;

    const price = Number(
      customer.pricePerLitre || 50
    );

    const amount = safeLitres * price;

    const delivery = await Delivery.findOneAndUpdate(
      {
        customerId,
        date,
        session
      },

      {
        customerId,
        date,
        session,
        litres: safeLitres,
        delivered: Boolean(delivered),
        paid: Boolean(paid),
        amount,
        note: note || ""
      },

      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.json(delivery);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
});


/*
UPDATE PAYMENT STATUS
*/
router.patch("/:id/payment", async (req, res) => {
  try {

    const delivery =
      await Delivery.findByIdAndUpdate(
        req.params.id,
        {
          paid: req.body.paid
        },
        {
          new: true
        }
      );

    res.json(delivery);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
});


export default router;