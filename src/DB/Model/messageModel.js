import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    message: {
        type: String,
    },
    sender_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
    },
    reciever_Id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
    },
    conversation : {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'chat'
    }
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("message", messageSchema);
export default messageModel;
