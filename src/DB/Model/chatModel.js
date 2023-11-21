import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    
    sender_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
    },
    reciever_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
    },
    lastmessage:{
        type :String,
        default : ""
    }
  },
  {
    timestamps: true,
  }
);

const chatModel = mongoose.model("chat", chatSchema);
export default chatModel;
