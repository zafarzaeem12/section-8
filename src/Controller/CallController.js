import callModel from "../DB/Model/callModel.js";
import mongoose from 'mongoose';
const Calling_Start = async (req,res,next) => {
try{
    const { call_to , call_duration , call_type } = req.body
    const { id } = req.user
    
    const Data = {
        call_to ,
        call_from : id,
        call_duration,
        call_type
    }

    const createCall =  await callModel.create(Data)

    res.status(201).send({
        message : 'Call created Successfully',
        status : 1,
        data : createCall
    })

}catch(err){
    res.status(500).send({
        message : 'Call not created',
        status : 0
    })

}
}

const get_Call_Record = async (req,res,next) => {
    const id = new mongoose.Types.ObjectId(req.user.id)
try{
    const callRecord = 
    await callModel.aggregate([
        {
          '$match': {
            'call_from': id
          }
        }, {
          '$lookup': {
            'from': 'auths', 
            'localField': 'call_to', 
            'foreignField': '_id', 
            'as': 'call_to'
          }
        }, {
          '$lookup': {
            'from': 'auths', 
            'localField': 'call_from', 
            'foreignField': '_id', 
            'as': 'call_from'
          }
        }, {
          '$unwind': {
            'path': '$call_to', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$unwind': {
            'path': '$call_from', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'fileuploads', 
            'localField': 'call_to.image', 
            'foreignField': '_id', 
            'as': 'call_to.image'
          }
        }, {
          '$lookup': {
            'from': 'fileuploads', 
            'localField': 'call_from.image', 
            'foreignField': '_id', 
            'as': 'call_from.image'
          }
        }, {
          '$unwind': {
            'path': '$call_from.image', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$unwind': {
            'path': '$call_to.image', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$unset': [
            'updatedAt', '__v', 'call_to.image.__v', 'call_to.image._id', 'call_to.image.fileType', 'call_to.image.user', 'call_to.image.createdAt', 'call_to.image.updatedAt', 'call_to.email', 'call_to.password', 'call_to.location', 'call_to.userType', 'call_to.isBlocked', 'call_to.isDeleted', 'call_to.devices', 'call_to.otp', 'call_to.isVerified', 'call_to.createdAt', 'call_to.favourite', 'call_to.updatedAt', 'call_to.__v', 'call_to.facebookId', 'call_to.instgramId', 'call_to.reviews', 'call_from.email', 'call_from.password', 'call_from.location', 'call_from.userType', 'call_from.isBlocked', 'call_from.isDeleted', 'call_from.devices', 'call_from.otp', 'call_from.isVerified', 'call_from.createdAt', 'call_from.favourite', 'call_from.updatedAt', 'call_from.__v', 'call_from.facebookId', 'call_from.instgramId', 'call_from.reviews', 'call_from.image.__v', 'call_from.image._id', 'call_from.image.fileType', 'call_from.image.user', 'call_from.image.createdAt', 'call_from.image.updatedAt', 'call_from.isCompleted', 'call_from.bio', 'call_from.fullname'
          ]
        }, {
          '$sort': {
            'createdAt': -1
          }
        }
      ])
    
    res.status(200).send({
        total : callRecord.length,
        message : 'call data fetched',
        status : 1,
        data : callRecord
    })
}catch(err){
    res.status(500).send({
        message : 'no call data fetched',
        status : 0
    })
}
}

const delete_Call_Record = async (req,res,next) => {
try{
    const checkRecord = await callModel.findOne({_id : req.params.id})
    if(!checkRecord){
        return res.status(404).send({
             message : 'no call record found',
             status : 0
    })
    }

    await callModel.deleteOne({ _id : req.params.id})
    res.status(200).send({
        message : "Call record deleted successfully",
        status : 1
    })
}catch(err){
    res.status(500).send({
        message : "no Call record deleted",
        status : 0
    })
}
}
const CallController = {
    Calling_Start,
    get_Call_Record,
    delete_Call_Record
  };
  
  export default CallController;