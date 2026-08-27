import mongoose from "mongoose";

const occasionalSaleSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      enum: ["morning", "evening"],
      default: "morning",
    },
    litres: {
      type: Number,
      required: true,
      min: 0.01,
    },
    pricePerLitre: {
      type: Number,
      default: 50,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
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

occasionalSaleSchema.index({ customerId: 1, date: 1 });
occasionalSaleSchema.index({ date: 1 });

export default mongoose.model("OccasionalSale", occasionalSaleSchema);
