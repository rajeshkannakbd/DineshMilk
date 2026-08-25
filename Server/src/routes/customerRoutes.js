import express from "express";
import Customer from "../Models/Customer.js";

const router = express.Router();

/*
GET ALL CUSTOMERS
*/
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find({
      active: true
    }).sort({
      name: 1
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


/*
ADD CUSTOMER
*/
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


/*
UPDATE CUSTOMER
*/
router.put("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json(customer);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});


/*
DELETE / ARCHIVE CUSTOMER
*/
router.delete("/:id", async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(
      req.params.id,
      {
        active: false
      }
    );

    res.json({
      message: "Customer archived successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

export default router;