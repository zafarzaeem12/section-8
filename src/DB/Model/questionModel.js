import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
        type : String,
    },
    questionType:{
        type:String,
        enum : ["dropdown","text"]
    },
    answer:[
     { 
        answer: {
              type : mongoose.Schema.Types.ObjectId,
              ref : 'answer'
             
         }
         }
    ],
    userType:{
        type:String,
        enum: ["owner", "tenant", "admin"],
        default : "admin"
    }
    
   
  },
  {
    timestamps: true,
  }
);

const questionModel = mongoose.model("question", questionSchema);
export default questionModel;
