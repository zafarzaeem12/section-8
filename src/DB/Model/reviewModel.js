import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },
    propertyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "listing",
    },
    message: {
      type: String,
      requred: true,
    },
    rating: {
      type: Number,
      max: 5,
      min: 1,
      requred: true,
    },
    reply: {
      type: String,
      requred: false,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
