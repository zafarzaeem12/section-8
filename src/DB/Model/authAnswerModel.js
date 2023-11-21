import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question_id :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'question'
    },
    answer:{
        type : String
    },
    userType: {
        type: String,
        enum: ["owner", "tenant", "admin"],
        default:"admin"
      },
  },
  {
    timestamps: true,
  }
);

const answerModel = mongoose.model("answer", answerSchema);
export default answerModel;
