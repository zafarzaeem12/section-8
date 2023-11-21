import mongoose from "mongoose";

const PropertyRequestSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: false,
    },
    zip: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },

    propertyID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "listing",
    },
    requesterID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },

    file: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "fileUpload",
    },

    status: {
      enum: ["pending", "approved", "rejected"],
      type: String,
      default: "pending",
      required: true,
    },

    approvedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "auth",
    },
  },
  {
    timestamps: true,
  }
);

const PropertyRequestModel = mongoose.model(
  "propertyrequest",
  PropertyRequestSchema
);

export default PropertyRequestModel;
