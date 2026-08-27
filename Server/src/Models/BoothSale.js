import mongoose from "mongoose";

const boothSaleSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    litres: {
      type: Number,
      default: null,
      min: 0,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("BoothSale", boothSaleSchema);
