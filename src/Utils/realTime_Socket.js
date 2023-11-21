import ChatController from '../Controller/ChatController.js';
import push_notification from '../Config/push_notification.js';
import userModel from '../DB/Model/authModel.js'
import mongoose from 'mongoose';
const { 
    Sending_Messages,
    Getting_Messages,
    Deleting_Messages,
    ChatlistItem,
    Chatlist
 } = ChatController
import {joseJwtDecrypt} from './AccessTokenManagement/Tokens.js'
import {realTime_socketAuth} from './realTime_socketAuth.js'
export const realTime_Socket = (io) => {
        // socket auth middleware start
         realTime_socketAuth(io);
         // socket auth middleware end
   

   io.on("connection", (socket) => {
          // for sending messages event 
        socket.on("Sending_Messages", (object) => {
             const senderID = object.sender_Id;
             const reciverID = object.reciever_Id;
             const userID = socket.user.payload?.uid;
            try{
            if(userID != senderID){
                 socket.emit('id_error', 
                'Token Id and SenderId not matched');
            }
           else if(userID == senderID){
            const room = `room person1 ${senderID} and person2 ${reciverID} `;
            socket.join(room);
            
            Sending_Messages(object,async (response) => {
                
                  
                  const sender_object = await userModel.find({_id : object.sender_Id}).populate('image').populate('devices')
                  const receiver_object = await userModel.find({_id : object.reciever_Id}).populate('image').populate('devices')
                 console.log("333333222",sender_object,receiver_object)
                let receiver_device_token = "";
                let receiver_name = "";
                let is_notification_reciever = " ";
                for (let i = 0; i < receiver_object.length; i++) {
                    console.log("receiver_object",receiver_object)
                  receiver_device_token = receiver_object[i].devices.map((data) => data.deviceToken).pop();
                  receiver_name = receiver_object[i].name;
                  is_notification_reciever = receiver_object[i].notificationOn;
                }
          
                let sender_device_token = "";
              let sender_name = "";
              let sender_image = "";
              // let sender_id = "";
              for (let i = 0; i < sender_object.length; i++) {
                sender_device_token = sender_object[i].devices.map((data) => data.deviceToken).pop();
                sender_name = sender_object[i].name;
                sender_image = sender_object[i].image ? sender_object[i].image.file : null
                // sender_id = sender_object[i]._id;
              }

              const notification_obj_receiver = {
                to: receiver_device_token,
                title: receiver_name,
                body: `${sender_name} has send you a message.`,
                // notification_type: 'msg_notify',
                // vibrate: 1,
                // sound: 1,
                // sender_id: object.sender_Id,
                // sender_name: sender_name,
                // sender_image: sender_image,
              };

             

              if (receiver_object[0].notificationOn === true) {
                push_notification(notification_obj_receiver);
            }

                io.to(room).emit('new_messages', {
                    object_type: "sending_Messages",
                    message: response,
                });
            }); 
           }
            }catch(err){
                console.log("====>",err)
               socket.emit('authentication_error', 
                'Token verification failed');
                  // Optionally disconnect the socket
                  socket.disconnect();   
            }
            
        });
        // for getting messages events
        socket.on("Getting_Messages", (object) => { 
            const senderID = object.sender_Id;
            const reciverID = object.reciever_Id;
           
            const room = `room person1 ${senderID} and person2 ${reciverID} `;
            socket.join(room);
            
            Getting_Messages(object,(response) => {
               
                io.to(room).emit('new_messages', {
                    object_type: "fetching_Messages",
                    message: response,
                });
            });
        });
        // for deleting message event
        socket.on("Deleting_Messages" , (object) => {
            const senderID = object.sender_Id;
            const messageID = object._id;
            const userID = socket.user.payload.uid;
            try{
                 if(userID == senderID){
            const room = `room person1 ${senderID} has deleted message with ${messageID}`;
            socket.join(room);

            Deleting_Messages(object, (response) => {
                io.to(room).emit('new_messages', {
                    object_type: "deleting_Messages",
                    message: response,
                });
            })  
                 }
            }catch(err){
                socket.emit('authentication_error', 
                'Token verification failed');
                  // Optionally disconnect the socket
                  socket.disconnect();   
            
            }
        
        });
        // for chatlist event 
         socket.on("Chatlist" , (object) => {
             try{
                 const userID = socket.user.payload.uid
            const sender_ID = object.sender_Id;
            
            if(userID == sender_ID){
                console.log("===========>" , userID , sender_ID)
                const room = `token id ${userID} and sender_ID is ${sender_ID}`;
                socket.join(room);
    
                     return   Chatlist(object, (response) => {
                            io.to(room).emit('new_messages', {
                                object_type: "conversation_chatlist",
                                message: response,
                            });
                        })
                    } 
             }catch(err){
                socket.emit('authentication_error', 
                'Token verification failed');
                  // Optionally disconnect the socket
                  socket.disconnect(); 
             }
           
            
        })
        // for delete chatlistitem with history messages
        socket.on("ChatlistItem" , (object) => {
            const userID = socket.user.payload.uid
            const Conversation_ID = object.id
            try{
             console.log("===========>" , userID , Conversation_ID )
            const room = `token id ${userID} and Conversation_ID is ${Conversation_ID}`;
            socket.join(room);

              ChatlistItem(object, (response) => {
                io.to(room).emit('new_messages', {
                    object_type: "conversation_chatlist",
                    message: response,
                });
            })
                
            }catch(err){
                socket.emit('authentication_error', 
                'Token verification failed');
                  // Optionally disconnect the socket
                  socket.disconnect();    
            }
            
            
        })
    });
}
