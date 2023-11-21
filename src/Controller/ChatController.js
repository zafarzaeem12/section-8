
import messageModel from "../DB/Model/messageModel.js";
import chatModel from "../DB/Model/chatModel.js";

const Sending_Messages = async (object, callback) => {
  try {
   
    const existingConversation = await chatModel.findOne({
      $or: [
        { sender_Id: object.sender_Id, reciever_Id: object.reciever_Id },
        { sender_Id: object.reciever_Id, reciever_Id: object.sender_Id },
      ],
    });

    if (existingConversation) {
      const message = {
        message: object.message,
        sender_Id: object.sender_Id,
        reciever_Id: object.reciever_Id,
        conversation: existingConversation._id,
      };
      const newMessage = await messageModel.create(message);
      return callback(newMessage);
    } else {
      const conversationData = {
        sender_Id: object.sender_Id,
        reciever_Id: object.reciever_Id,
      };
      const newConversation = await chatModel.create(conversationData);

      const message = {
        message: object.message,
        sender_Id: object.sender_Id,
        reciever_Id: object.reciever_Id,
        conversation: newConversation._id,
      };
      const newMessage = await messageModel.create(message);
      return callback(newMessage);
    }
  } catch (err) {
    callback(err);
  }
};


  const Getting_Messages = async (object , callback) => {
    const sender = object.sender_Id;
    const reciever = object.reciever_Id;
    if(sender == object.sender_Id &&  reciever == object.reciever_Id){
        const get_data = await messageModel.find({ $or:[{sender_Id : sender } , {reciever_Id : reciever  }]   }).sort({createdAt: -1  })
        callback(get_data)
    }else if(reciever == object.sender_Id &&  sender == object.reciever_Id){
        const get_data = await messageModel.find({ $or:[{sender_Id : reciever } , {reciever_Id : sender  }]   }).sort({createdAt: -1  })
        callback(get_data)
    }
}

const Deleting_Messages = async (object,callback) => {
try{
  await messageModel.deleteOne({ _id : object._id});
  const remainingMessages = await messageModel.find({sender_Id : object.sender_Id});
  callback(remainingMessages);
}catch(err){
callback("message not deleted",err);
}
}

const Chatlist = async (object,callback) => {
try{
  const last = await messageModel
  .findOne({sender_Id : object.sender_Id})
  .sort({createdAt : -1})
  .select("message conversation")
  
    await chatModel.updateOne({_id : last.conversation.toString() } , {$set : { lastmessage : last.message } } , { new :true });

  const allUsers =  await chatModel
  .find({ sender_Id : object.sender_Id })
  .populate({path :'sender_Id' , populate:({ path : "image" ,select: "file" }) ,select:"name phone email fullname" })
  .populate({path :'reciever_Id' , populate:({ path : "image" ,select: "file" }) ,select:"name phone email fullname" })
  .sort({ createdAt : -1 })


 callback(allUsers)
  ///res.status(200).send({ message : "Chatlist Data Fetched" , status : 1 , data : allUsers })
}catch(err){
  callback(err)
  //res.status(500).send({ message : "No Chatlist Data" , status : 0})
}
}

const ChatlistItem = async (object , callback) => {
  try{
    const { id } = object

    const checkchat = await chatModel.find({_id : id});
    
    if(checkchat.length == 0){
      return callback("already chatlist item deleted")
    }


    await chatModel.deleteOne({_id : id});
    await messageModel.deleteMany({conversation : id  })
    //res.status(200).send({ message : "Chat list item deleted successfully" , status : 1})
    callback("Chat list item deleted successfully")
  }catch(err){
    //res.status(500).send({ message : "Chat list item not deleted successfully" , status : 0})
    callback("Chat list item not deleted successfully")
  }
}

const ChatController = {
    Sending_Messages,
    Getting_Messages,
    Deleting_Messages,
    Chatlist,
    ChatlistItem
  };
  
  export default ChatController;