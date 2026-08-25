import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    date: {
      type: String,
      required: true
    },

    session: {
      type: String,
      enum: ["morning", "evening"],
      required: true
    },

    litres: {
      type: Number,
      default: 0
    },

    delivered: {
      type: Boolean,
      default: true
    },

    paid: {
      type: Boolean,
      default: false
    },

    amount: {
      type: Number,
      default: 0
    },

    note: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

deliverySchema.index(
  {
    customerId: 1,
    date: 1,
    session: 1
  },
  {
    unique: true
  }
);

export default mongoose.model("Delivery", deliverySchema);