import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      lowercase: true
    },
  },
  {
    timestamps: true,
  }
);

const CategoryModel = mongoose.model("category", CategorySchema);

export default CategoryModel;
