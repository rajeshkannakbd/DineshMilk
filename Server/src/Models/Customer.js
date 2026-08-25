import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    pricePerLitre: {
      type: Number,
      default: 50
    },

    morning: {
      enabled: {
        type: Boolean,
        default: true
      },

      litres: {
        type: Number,
        default: 1
      }
    },

    evening: {
      enabled: {
        type: Boolean,
        default: false
      },

      litres: {
        type: Number,
        default: 1
      }
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Customer", customerSchema);