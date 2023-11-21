import mongoose from "mongoose";

const useranswer_Schema = new mongoose.Schema(
  {
    answer: {
        type : Array,
    },
    auth_id:{ 
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
        
    }
  },
  {
    timestamps: true,
  }
);

const userAnswerModel = mongoose.model("useranswer", useranswer_Schema);
export default userAnswerModel;
