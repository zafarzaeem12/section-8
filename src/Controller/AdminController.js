import authModel from "../DB/Model/authModel.js";
import CategoryModel from "../DB/Model/categoryModel.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import NotificationModel from "../DB/Model/notificationModal.js";
import { hashPassword } from "../Utils/SecuringPassword.js";
import PropertyRequestModel from "../DB/Model/propertyRequestModel.js";
import ListingModel from "../DB/Model/listingModel.js";
import Review from "../DB/Model/reviewModel.js";
import ContentModel from "../DB/Model/contentModel.js";
import questionModel from "../DB/Model/questionModel.js";
import answerModel from "../DB/Model/authAnswerModel.js";
import { sendEmails } from "../Utils/SendEmail.js";

import {
  IdValidator,
  RegisterUserValidator,
} from "../Utils/Validator/UserValidator.js";
import {
  designationValidator,
  notificationValidator,
  aboutValidator,
} from "../Utils/Validator/adminvalidator.js";

import push_notifications from "../Config/push_notification.js";

// const adminregister = async () => {
//   const AuthModel = new authModel();
//   AuthModel.email = "admin@admin.com";
//   AuthModel.password = hashPassword("123456");
//   AuthModel.userType = "admin";
//   AuthModel.name = "admin";
//   await AuthModel.save()
// };
// adminregister();
// const registerUser = async (req, res, next) => {
//   try {
//     const { error } = RegisterUserValidator.validate(req.body);
//     if (error) {
//       return next(CustomError.badRequest(error.details[0].message));
//     }
//     const { email } = req.body;

//     const IsUser = await authModel.findOne({ email });
//     if (IsUser) {
//       if (IsUser?.status == "pending") {
//         return next(
//           CustomError.createError(
//             "Invitation link sended to User but not accpeted yet",
//             400
//           )
//         );
//       }
//       if (IsUser?.isDeleted == true) {
//         return next(
//           CustomError.createError(
//             "User was exist in past now the account is deleted",
//             400
//           )
//         );
//       }
//       return next(CustomError.createError("User Already Exists", 400));
//     }

//     const AuthModel = new authModel();

//     AuthModel.email = email;
//     AuthModel.name = email.split("@")[0];
//     await AuthModel.save();
//     await sendEmails(
//       email,
//       `Wellcome to join Section Eight community`,
//       `We wellcome you in our Section Eight community by joining using our app by this unique Id: ${email}`
//     );

//     return next(
//       CustomSuccess.createSuccess(
//         { uniqueId: email },
//         "User Invitation sent successfully",
//         200
//       )
//     );
//   } catch (error) {
//     next(CustomError.createError(error.message, 500));
//   }
// };

//module.exports = { createContent, upload };

//export default router;

const createCategory = async (req, res) => {
  try {
    const { title } = req.body;

    const existingCategory = await CategoryModel.findOne({ title });

    if (existingCategory) {
      return res.status(400).json({
        status: 0,
        message: "Category with the same title already exists",
      });
    }

    const category = new CategoryModel({ title });

    await category.save();

    return res.status(201).json({
      status: 1,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: 0, message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();

    return res.status(200).json({
      status: 1,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: 0, message: error.message });
  }
};

const SendNotification = async (req, res, next) => {
  try {
    const { error } = notificationValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { userId, allUser, title, body } = req.body;
    var data = [];
    if (allUser) {
      data = [...(await authModel.find({}).populate("devices"))];
    } else {
      data = [
        ...(await authModel.find({ _id: { $in: userId } }).populate("devices")),
      ];
    }
    console.log(data);
    data.map((item) => {
      item.devices.map(async (item2) => {
        await push_notifications({
          deviceToken: item2.deviceToken,
          title,
          body,
        });

        const pushNotification = new NotificationModel({
          title,
          description: body,
          user: item2._id,
        });
        await pushNotification.save();
      });
    });
    return next(
      CustomSuccess.createSuccess({}, "Notification Sent successfully", 200)
    );
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update the fields: isDeleted = true, notificationOn = false
    const updatedUser = await authModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        notificationOn: false,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    // Handle the error
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: err.message,
    });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    // Retrieve all users excluding the password field
    const users = await authModel.find().select("-password");

    return res.status(200).json({
      status: true,
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

const filterUser = async (req, res, next) => {
  try {
    const { query } = req;
    const user = await authModel.findOne(query);
    return next(
      CustomSuccess.createSuccess(user, "User Found Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(CustomError.badRequest("ID is required!"));
    }
    let getUser = await authModel.findById(id);
    if (!getUser) {
      return next(CustomError.badRequest("Could not find user!"));
    }
    if (getUser.isBlocked === true) {
      getUser = await authModel.findByIdAndUpdate(
        id,
        {
          $set: { isBlocked: false },
        },
        { new: true }
      );
    } else {
      getUser = await authModel.findByIdAndUpdate(
        id,
        { $set: { isBlocked: true } },
        { new: true }
      );
    }
    return next(
      CustomSuccess.createSuccess(getUser, "User Blocked Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const editUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is required!"));
    }
    if (req?.body?.email) {
      return next(CustomError.badRequest("You cannot update email!"));
    }
    const hashdedPassword = hashPassword(req.body.password);
    req.body.password = hashPassword(hashdedPassword);
    const getUser = await authModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return next(
      CustomSuccess.createSuccess(getUser, "User Edited Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getRequests = async (req, res, next) => {
  try {
    const { query } = req;
    const requests = await PropertyRequestModel.find(query);
    return next(
      CustomSuccess.createSuccess(requests, "User Edited Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is required!"));
    }
    const updatedRequest = await PropertyRequestModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    return next(
      CustomSuccess.createSuccess(
        updatedRequest,
        "User Edited Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const deletedRequest = await PropertyRequestModel.findByIdAndDelete(id, {
      new: true,
    });
    return next(
      CustomSuccess.createSuccess(
        deletedRequest,
        "User Edited Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getProperties = async (req, res, next) => {
  try {
    const { query } = req;
    const getProperties = await ListingModel.find(query);
    return next(
      CustomSuccess.createSuccess(
        getProperties,
        "User Edited Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const updatedProperty = await ListingModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return next(
      CustomSuccess.createSuccess(
        updatedProperty,
        "User Edited Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const deletedProperty = await ListingModel.findByIdAndDelete(id, req.body, {
      new: true,
    });

    return next(
      CustomSuccess.createSuccess(
        deletedProperty,
        "User Deleted Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getReviews = async (req, res, next) => {
  try {
    const { query } = req;
    const getReviews = await Review.find(query);
    return next(
      CustomSuccess.createSuccess(getReviews, "User Edited Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const updatedReview = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return next(
      CustomSuccess.createSuccess(
        updatedReview,
        "User Edited Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const deletedReview = await Review.findByIdAndDelete(id, { new: true });
    return next(
      CustomSuccess.createSuccess(
        deletedReview,
        "User Edited Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const createTerms = async (req, res, next) => {
  try {
    const { error } = aboutValidator.validate(req.body);
    if (error) {
      next(CustomError.badRequest(error.details[0].message));
    }
    const { title } = req.body;
    const updateTerms = await ContentModel.findOneAndUpdate(
      { contentType: "terms" },
      { title },
      { upsert: true, new: true }
    );
    return next(
      CustomSuccess.createSuccess(
        updateTerms,
        "Terms updated successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const deleteTerms = async (req, res, next) => {
  try {
    const deleteTerms = await ContentModel.findOneAndDelete(
      { contentType: "terms" },
      { new: true }
    );
    if (!deleteTerms) {
      next(CustomError.badRequest("There is no data to delete"));
    }
    return next(
      CustomSuccess.createSuccess(
        deleteTerms,
        "Terms deleted successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getTerms = async (req, res, next) => {
  try {
    const getTerms = await ContentModel.findOne({ contentType: "terms" });
    if (!getTerms) {
      CustomError.badRequest("Term is not available");
    }
    return next(
      CustomSuccess.createSuccess(getTerms, "Terms found successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const createPrivacy = async (req, res, next) => {
  try {
    const { error } = aboutValidator.validate(req.body);
    if (error) {
      next(CustomError.badRequest(error.details[0].message));
    }
    const { title } = req.body;
    const updatePrivacy = await ContentModel.findOneAndUpdate(
      { contentType: "privacy" },
      { title },
      { upsert: true, new: true }
    );
    return next(
      CustomSuccess.createSuccess(
        updatePrivacy,
        "Privacy updated successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const deletePrivacy = async (req, res, next) => {
  try {
    const deletePrivacy = await ContentModel.findOneAndDelete(
      { contentType: "privacy" },
      { new: true }
    );
    if (!deletePrivacy) {
      next(CustomError.badRequest("There is no data to delete"));
    }
    return next(
      CustomSuccess.createSuccess(
        deletePrivacy,
        "Terms deleted successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getPrivacy = async (req, res, next) => {
  try {
    const getPrivacy = await ContentModel.findOne({ contentType: "privacy" });
    if (!getPrivacy) {
      CustomError.badRequest("privacy is not available");
    }
    return next(
      CustomSuccess.createSuccess(getPrivacy, "Terms found successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const createAbout = async (req, res, next) => {
  try {
    const { error } = aboutValidator.validate(req.body);
    if (error) {
      next(CustomError.badRequest(error.details[0].message));
    }
    const { title } = req.body;
    const updateAbout = await ContentModel.findOneAndUpdate(
      { contentType: "about" },
      { title },
      { upsert: true, new: true }
    );
    return next(
      CustomSuccess.createSuccess(
        updateAbout,
        "About updated successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const deleteAbout = async (req, res, next) => {
  try {
    const deleteAbout = await ContentModel.findOneAndDelete(
      { contentType: "about" },
      { new: true }
    );
    if (!deleteAbout) {
      next(CustomError.badRequest("There is no data to delete"));
    }
    return next(
      CustomSuccess.createSuccess(
        deleteAbout,
        "About deleted successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getAbout = async (req, res, next) => {
  try {
    const getAbout = await ContentModel.findOne({ contentType: "about" });
    if (!getTerms) {
      CustomError.badRequest("About is not available");
    }
    return next(
      CustomSuccess.createSuccess(getAbout, "About found successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const createQuestions = async (req,res,next) => {
try{
  const { question ,questionType , userType } = req.body;

 const checkquestions = await questionModel.find({question : question});
 
  if(checkquestions.length > 0){
      return res.status(400).send({ message : "this question already exists" , status : 0})
  }

  const Data = {
    question,
    questionType
  }

  const addQuestion = await questionModel.create(Data)
 
  res.status(201).send({
     message : "Question added successfully",
     status : 1,
     data : addQuestion
    })
}catch(err){
    console.log("======>",err)
  res.status(500).send({
    message : "Question not added",
    status : 0
   })
}
}

const Answerquestions = async (req,res,next) => {
    try{
        const {question_id , answer } = req.body
        const checkQuestionstypes = await questionModel.findOne({_id : question_id })
        
        if(checkQuestionstypes.questionType === "dropdown"){
            const Data = {
                question_id , 
                answer
            }
            const answerd = await answerModel.create(Data);
            
            const answerid = answerd._id.toString()
            
            await questionModel.updateOne(
                {_id : question_id},
                {$push : { answer : { answer : answerid }}},
                {new : true}
                );
            
            return res
            .status(201)
            .send({ 
                message : "Answer against this question" , 
                status : 1 , 
                data : answerd  })
            
        }
        
        
    }catch(err){
        res
        .status(201)
        .send({ 
            message : "no Answer against this question" , 
            status : 0 , 
            }) 
    }
}

const getallAnswer = async (req,res,next) => {
    try{
                const data = [
          {
            '$lookup': {
              'from': 'answers', 
              'localField': 'answer.answer', 
              'foreignField': '_id', 
              'as': 'answer.answer'
            }
          }, {
            '$unset': [
              'answer.answer.userType', 'answer.answer.updatedAt', 'answer.answer.__v'
            ]
          }, 
        //   {
        //     '$sort': {
        //       'answer.answer.createdAt': -1
        //     }
        //   }
        ]
        const questionsanswer = await questionModel.aggregate(data);
        res.status(200).send({
            total : questionsanswer.length,
            message: "questionswith answer fetched",
            status: 1,
            data : questionsanswer
        })
    }catch(err){
         res.status(500).send({
            message: " no questionswith answer fetched",
            status: 0
        })
    }
}

// const getQuestion = async (req,res,next) => {
//     const id = req.params.id;
//     try{
//         const allQuestions = await questionModel.findOne({_id : id});
//         res.status(200).send({
//             message: "Question get successfully",
//             status : 1,
//             data : allQuestions
//         })
//     }catch(err){
//         res.status(500).send({
//             message: "Question not found",
//             status : 0
//         })
//     }
// }

// const getallUnits = async (req,res,next) => {
//     try{
//         const allunits = await unitsModel.find();
//         res.status(200).send({
//             total : allunits.length,
//             message: "units get successfully",
//             status : 1,
//             data : allunits
//         })
//     }catch(err){
//         res.status(500).send({
//             message: "units not found",
//             status : 0
//         })
//     }
// }

// const createNoofunits = async (req,res,next) => {
// try{
//   const { no_of_units,question_id } = req.body;

//   const Data = {
//   no_of_units,
//   question_id
//   }

// //   const addUnits = await unitsModel.create(Data)
// //   await questionModel.updateOne(
// //       {_id :question_id.toString() },
// //       {$push:{answer:{answer}}},
// //       {new : true}
// //       );
//   res.status(201).send({
//      message : "Unit added successfully",
//      status : 1,
//      data : addUnits
//     })
// }catch(err){
//     console.log("ppp",err)
//   res.status(500).send({
//     message : "units not found",
//     status : 0
//   })
// }
// }



const AdminController = {
    // getallUnits,
    // getQuestion,
    // createNoofunits,
  createQuestions,
  Answerquestions,
  getallAnswer,
  getAllUsers,
  deleteUser,
  SendNotification,
  createCategory,
  getAllCategories,
  filterUser,
  blockUser,
  editUser,
  getRequests,
  updateRequest,
  deleteRequest,
  getProperties,
  updateProperty,
  deleteProperty,
  getReviews,
  updateReview,
  deleteReview,
  createTerms,
  deleteTerms,
  getTerms,
  createPrivacy,
  deletePrivacy,
  getPrivacy,
  createAbout,
  deleteAbout,
  getAbout,
  createPrivacy,
  deletePrivacy,
  getPrivacy,
};

export default AdminController;
