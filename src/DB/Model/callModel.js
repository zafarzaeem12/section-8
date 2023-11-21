import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    
    call_to : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
    },
    call_from : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
    },
    call_duration :{
        type : String,
    },
    call_type:{
        type :String,
        enum : ['video' , 'audio'],
        default : 'audio'
    },
    user_status:{
        type : String,
        enum : ['online' , 'offline'],
        default : 'online'
    }
  },
  {
    timestamps: true,
  }
);

const callModel = mongoose.model("call", callSchema);
export default callModel;
