import express from "express";
import Delivery from "../Models/Delivery";

const router = express.Router();


/*
DAILY REPORT

GET

/api/reports/daily?date=2026-08-24
*/
router.get("/daily", async (req, res) => {

  try {

    const { date } = req.query;

    const rows = await Delivery
      .find({ date })
      .populate("customerId");


    const result = {

      date,

      morning: {
        litres: 0,
        amount: 0,
        delivered: 0,
        count: 0
      },

      evening: {
        litres: 0,
        amount: 0,
        delivered: 0,
        count: 0
      },

      total: {
        litres: 0,
        amount: 0,
        paid: 0,
        pending: 0,
        delivered: 0
      }

    };


    for (const row of rows) {

      const session =
        result[row.session];


      session.litres += row.litres;

      session.amount += row.amount;

      session.count += 1;

      if (row.delivered) {
        session.delivered += 1;
      }


      result.total.litres += row.litres;

      result.total.amount += row.amount;

      if (row.delivered) {
        result.total.delivered += 1;
      }


      if (row.paid) {

        result.total.paid += row.amount;

      } else {

        result.total.pending += row.amount;

      }

    }


    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


/*
MONTHLY REPORT

Example:

/api/reports/monthly?month=2026-08
*/
router.get("/monthly", async (req, res) => {

  try {

    const { month } = req.query;

    const rows = await Delivery.find({
      date: {
        $regex: `^${month}`
      }
    });


    const total = rows.reduce(
      (acc, row) => {

        acc.litres += row.litres;

        acc.amount += row.amount;

        if (row.paid) {

          acc.paid += row.amount;

        } else {

          acc.pending += row.amount;

        }

        return acc;

      },
      {
        litres: 0,
        amount: 0,
        paid: 0,
        pending: 0
      }
    );


    res.json(total);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


export default router;