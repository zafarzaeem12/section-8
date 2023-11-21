import mongoose from "mongoose";

const EventSchema = mongoose.Schema({
// EventType:{
//     type:String,
//     enum:["events"],
//     default:null
// },
title:{type:String,required: true},
location:{type:String,required: true},
description:{type:String},
file:[{    
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "fileUpload",
}],
user:{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "auth",
},
eventusers:[{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "auth",
}],
date:{
    type: Date,
    required: true,
    
},

},{
    timestamps: true,
    
})



const EventModel = mongoose.model("Event", EventSchema);

export default EventModel;