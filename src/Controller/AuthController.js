import fs from "fs";
import bcrypt from "bcrypt";
import authModel from "../DB/Model/authModel.js";
import answerModel from '../DB/Model/authAnswerModel.js'
import questionModel from '../DB/Model/questionModel.js'
import userAnswerModel from '../DB/Model/userAnswerModel.js'
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { comparePassword, hashPassword } from "../Utils/SecuringPassword.js";
import { sendEmails } from "../Utils/SendEmail.js";
import { mongoose } from "mongoose";
import { accessTokenValidator } from "../Utils/Validator/accessTokenValidator.js";
import NotificationController from "./NotificationController.js";
import jwt from "jsonwebtoken";
import twilio from "twilio";
const accountSid = "AC790bdea48d84cf7306e50b21b0b33658";
const authToken = "2c0b075559234f5bd75a81ce7a38b07d";
const twilioClient = twilio(accountSid, authToken);
import { OAuth2Client } from 'google-auth-library';
import {
  LoginUserValidator,
  RegisterUserValidator,
  ResetPasswordValidator,
  changePasswordValidator,
  createprofilevalidator,
  forgetpasswordValidator,
  updatevalidator,
  verifyOTPValidator,
} from "../Utils/Validator/UserValidator.js";
import { linkUserDevice, unlinkUserDevice } from "../Utils/linkUserDevice.js";
import { tokenGen } from "../Utils/AccessTokenManagement/Tokens.js";
import OtpModel from "../DB/Model/otpModel.js";
import { genSalt } from "../Utils/saltGen.js";
import { Types } from "mongoose";

const SocialLoginUser = async (req, res, next) => {
  try {
    //const { error } = SocailLoginValidator.validate(req.body);
    // if (error) {
    //   return next(CustomError.badRequest(error.details[0].message));
    // }

    const { deviceToken, deviceType, accessToken, socialType, userType } =
      req.body;
    const { hasError, message, data } = await accessTokenValidator(
      accessToken,
      socialType
    );
    if (hasError) {
      return next(CustomError.createError(message, 200));
    }
    const { name, image, identifier, dateOfBirth, gender } = data;

    const authmodel = await AuthModel.findOne({
      identifier: identifier,
    }).populate("profile");
    if (authmodel) {
      var UserProfile;

      if (authmodel.userType == "Customer") {
        const CustomerProfile = await CustomerModel.find({
          auth: authmodel._id,
        }).populate({
          path: "profile",
        });

        CustomerProfile.isCompleteProfile = authmodel.isCompleteProfile;

        const token = await tokenGen(CustomerProfile, "auth", deviceToken);
        // UserProfile = otpResource.BusinessWithToken(CustomerProfile, token);
        UserProfile = { ...CustomerProfile, token };
      }
      if (authmodel.userType == "Instructor") {
        const InstructorProfile = await InstructorModel.find({
          auth: authmodel._id,
        }).populate({
          path: "profile",
        });
        InstructorProfile.isCompleteProfile = authmodel.isCompleteProfile;
        const token = await tokenGen(InstructorProfile, "auth", deviceToken);
        // UserProfile = otpResource.WorkerWithToken(InstructorProfile, token);
        UserProfile = { ...InstructorProfile, token };
      }

      const { error } = await linkUserDevice(
        authmodel._id,
        deviceToken,
        deviceType
      );
      if (error) {
        return next(CustomError.createError(error, 200));
      }
      // const Device = new DeviceModel();
      // Device.deviceType = deviceType;
      // Device.deviceToken = deviceToken;
      // authmodel.devices.push(Device);
      // await authmodel.save();
      // const token = await tokenGen(UserProfile, "auth", deviceToken);
      const respdata = {
        _id: UserProfile._id,
        fullName: UserProfile.fullName,
        follower:
          UserProfile.follower.length > 0 ? UserProfile.follower.length : 0,
        following:
          UserProfile.following.length > 0 ? UserProfile.following.length : 0,
        routine: UserProfile.routine,
        nutrition: UserProfile.nutrition,
        dietplane: UserProfile.dietplane,
        userType: authmodel.userType,
        image: await fileUploadModel.findOne(
          { _id: UserProfile.image },
          { file: 1 }
        ),
        isCompleteProfile: authmodel.isCompleteProfile,
        token: UserProfile.token,
      };
      return next(CustomSuccess.createSuccess(respdata, "User Logged In", 200));
    } else {
      // const genOpt = Math.floor(10000 + Math.random() * 90000);
      const authmodel = new AuthModel();
      authmodel.identifier = identifier;
      authmodel.password = password;
      authmodel.userType = userType;
      authmodel.socialId = socialID;
      authmodel.socialType = socialType;
      authmodel.accessToken = accessToken;
      await authmodel.save();

      // const OptSend = await OtpModel.create({
      //   otpKey: genOpt,
      //   auth: authmodel._id,
      //   otpType: "register",
      // });
      // OptSend.save()

      // let subject = "OTP for Registration";
      // let template = await getFileContent(path.join("src", "Static", "create-user.html"));
      // template = template.replace("{{verification}}", OptSend.otpKey);
      // template = template.replace("{{email}}", AuthModel.identifier);
      // sendEmails(AuthModel.identifier, subject, template, (err, data) => {
      //   if (err) {
      //     next(CustomError.badRequest(err.message));
      //   } else {
      //   }
      // });
      var UserModel;
      if (userType == "Customer") {
        UserModel = await CustomerModel.create({
          auth: authmodel._id,
          fullName: name,
        });
        UserModel.save();
      } else {
        UserModel = await InstructorModel.create({
          auth: authmodel.id,
          fullName: name,
        });
        UserModel.save();
      }
      // const NewInAppFeatures = await inAppFeatureModel.create({
      //   userType: user_type == "salon" ? "business" : "worker",
      //   userProfile: UserModel._id,
      // });
      authmodel.profile = UserModel._id;
      await authmodel.save();
      const data = await AuthModel.findById(authmodel._id).populate("profile");

      const token = await tokenGen(data, "auth", deviceToken);

      const respdata = {
        _id: data.profile._id,
        fullName: data.profile.fullName,
        follower: data.profile.follower.length > 0 ? data.profile.length : 0,
        following: data.profile.following.length > 0 ? data.profile.length : 0,
        routine: data.profile.routine,
        nutrition: data.profile.nutrition,
        dietplane: data.profile.dietplane,
        userType: data.userType,
        image: { file: "" },
        isCompleteProfile: data.isCompleteProfile,
        token: token,
      };

      return next(
        CustomSuccess.createSuccess(respdata, "SignUp successfully", 200)
      );
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
const client = new OAuth2Client(process.env.Google_Client_ID);
const socialLogin = async (req,res,next) => {
try{

  const { socialLogin  } = req.body;
  if(socialLogin === "google"){
   
    const check = await client.verifyIdToken({ 
      idToken : process.env.Google_Client_secret,
      audience : process.env.Google_Client_ID
     })
   console.log("check",check) 
    // const googleResponse = await client.verifyIdToken({ 
    //   idToken : accessToken,
    //   audience : process.env.Google_Client_ID
    // })
    // console.log("googleResponse",googleResponse)
  }
}catch(err){
  console.log(err)
}
}

const verifyuniqueid = async (req, res, next) => {
  try {
    const { error } = RegisterUserValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const AuthModel = await authModel.aggregate([
      {
        $match: { email: req.body.email },
      },
    ]);

    if (AuthModel.length > 0) {
      if (AuthModel[0].status != "pending") {
        return next(CustomError.badRequest("User Already registered"));
      }
      return next(CustomSuccess.createSuccess({}, "Unique Id is Valid", 200));
    } else {
      return next(CustomError.badRequest("Unique Id is Invalid"));
    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

//complete profile
const createProfile = async (req, res, next) => {
  try {
    const { email, password, name, code, phone, location } = req.body;

    // Check if the email already exists
    const existingUser = await authModel.findOne({ email });
    if (existingUser) {
      return next(CustomError.badRequest("Email already exists"));
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Generate a verification code (you can use a library like 'crypto-random-string' for this)

    // Send verification code via Twilio SMS
    // let userOTP = Math.floor(Math.random() * 90000) + 100000;
    //DISABLED SMS API
    //   try {
    //     await twilioClient.messages.create({
    //       body: `Your Section 8 verification code is: ${userOTP}`,
    //       from: '+12525184622',
    //       to: phone,
    //     });
    //   } catch (twilioError) {
    //     console.log("twilioError",twilioError)
    //     return next(CustomError.createError("Failed to send verification code", 500));
    //   }

    // Create the user
    const newUser = {
      email,
      password: hashedPassword,
      name,
      code,
      phone,
    //   location,
      isVerified: true,
    };

    console.log("newUser",newUser)
    var token = jwt.sign({ userData: newUser }, "secret");
    //var token = jwt.sign({userData:newUser , otp:userOTP} , 'secret' ) //jwt.sign({userData:newUser , otp:userOTP} , 'secret' , {expiresIn:1})

    return next(
      CustomSuccess.createSuccess(
        { token },
        "Verification OTP has been sended",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const data = Object.fromEntries(
      Object.entries(req.body).filter(
        ([_, v]) => v != null && v !== "" && v !== "null"
      )
    );
 
    const { deviceToken } = req.headers;
    const { error } = updatevalidator.validate(data);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }

    const { user } = req;
    
   // console.log("user UPDATED =>", user);

    if (!user) {
      return next(CustomError.badRequest("User Not Found"));
    }
    
    

    if (req.files["file"]) {
      // Process 'file' upload if it exists in the request
      const file = req.files["file"][0];

      if (
        user.image &&
        user.image.file != null &&
        user.image.file != undefined
      ) {
        fs.unlink("Uploads/" + user.image.file, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
        await fileUploadModel.deleteOne(user.image?._id);
      }
      const FileUploadModel = await fileUploadModel.create({
        file: file.path.replace(/\\/g, "/"),
        fileType: file.mimetype,
        user: user._id,
      });
      data.image = FileUploadModel._id;
    }

    if (req.files["coverImageFile"]) {
      // Process 'coverImageFile' upload if it exists in the request
      const coverImageFile = req.files["coverImageFile"][0];

      if (
        user.coverImage &&
        user.coverImage.file != null &&
        user.coverImage.file != undefined
      ) {
        fs.unlink("Uploads/" + user.coverImage.file, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
        await fileUploadModel.deleteOne(user.coverImage?._id);
      }
      const CoverImageModel = await fileUploadModel.create({
        file: coverImageFile.path.replace(/\\/g, "/"),
        fileType: coverImageFile.mimetype,
        user: user._id,
      });
      data.coverImage = CoverImageModel._id;
    }
    if(data.location){
         const location = JSON.parse(data.location);
        const latitude = location[1];
        const longitude = location[0];
        data.location = {
        type: 'Point',
        coordinates: [longitude,latitude]
      }
    }
    
    if (data.password) {
      data.password = hashPassword(data.password);
    }
    
     if (data.address) {
      data.address = data.address;
    }

    delete data.long;
    delete data.lat;

    const updateUser = await authModel.findByIdAndUpdate(
      user._id,
      { isCompleted: true, ...data },
      {
        new: true,
      }
    );

    const token = await tokenGen(
      { id: updateUser._id, userType: updateUser.userType },
      "auth",
      deviceToken
    );

  
    const userdata = (
      await authModel.aggregate([
        {
          ///$match: { email: email, status: "accepted" },
          $match: { _id: user._id },
        },
        {
          $lookup: {
            from: "fileuploads",
            localField: "image",
            foreignField: "_id",
            as: "image",
          },
        },
        {
          $unwind: {
            path: "$image",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "fileuploads",
            localField: "coverImage",
            foreignField: "_id",
            as: "coverImage",
          },
        },
        {
          $unwind: {
            path: "$coverImage",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "answers",
            localField: "anwserid",
            foreignField: "_id",
            as: "anwserid",
          },
        },
        {
          $unwind: {
            path: "$anwserid",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            devices: 0,
            loggedOutDevices: 0,
            otp: 0,
            updatedAt: 0,
            createdAt: 0,
            __v: 0,
            isDeleted: 0,
            "image.updatedAt": 0,
            "image.createdAt": 0,
            "image.__v": 0,
            "image.user": 0,
            "image.fileType": 0,
            "image._id": 0,
            "coverImage._id": 0,
            "coverImage.updatedAt": 0,
            "coverImage.createdAt": 0,
            "coverImage.__v": 0,
            "coverImage.user": 0,
            "coverImage.fileType": 0,
            "anwserid.unitAnswer" : 0,
            "anwserid.descritptionAnswer" : 0,
            "anwserid.typeAnswer" : 0,
            "anwserid.auth_id" : 0,
            "anwserid.createdAt" : 0,
            "anwserid.updatedAt" : 0,
            "anwserid.__v" : 0,
            "anwserid.question_id" : 0
          },
        },
        { $limit: 1 },
      ])
    )[0];


    return next(
      CustomSuccess.createSuccess(
        { ...userdata, token },
        "Profile updated successfully",
        200
      )
    );
  } catch (error) {
      console.log("kkk",error)
    next(CustomError.createError(error.message, 500));
  }
};

const LoginUser = async (req, res, next) => {
  try {
    const { error } = LoginUserValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { email, password, deviceType, deviceToken } = req.body;
    const AuthModel = (
      await authModel.aggregate([
        {
          ///$match: { email: email, status: "accepted" },
          $match: { email: email },
        },
        {
          $lookup: {
            from: "fileuploads",
            localField: "image",
            foreignField: "_id",
            as: "image",
          },
        },
        {
          $unwind: {
            path: "$image",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "fileuploads",
            localField: "coverImage",
            foreignField: "_id",
            as: "coverImage",
          },
        },
        {
          $unwind: {
            path: "$coverImage",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            devices: 0,
            loggedOutDevices: 0,
            otp: 0,
            updatedAt: 0,
            createdAt: 0,
            __v: 0,
            isDeleted: 0,
            "image.updatedAt": 0,
            "image.createdAt": 0,
            "image.__v": 0,
            "image.user": 0,
            "image.fileType": 0,
            "image._id": 0,
            "coverImage._id": 0,
            "coverImage.updatedAt": 0,
            "coverImage.createdAt": 0,
            "coverImage.__v": 0,
            "coverImage.user": 0,
            "coverImage.fileType": 0,
          },
        },
        { $limit: 1 },
      ])
    )[0];

    if (!AuthModel) {
      return next(CustomError.createError("User Not Found", 200));
    }

    const isPasswordValid = comparePassword(password, AuthModel.password);
    if (!isPasswordValid) {
      return next(CustomError.badRequest("Invalid Password"));
    }
    const device = await linkUserDevice(AuthModel._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }

    const token = await tokenGen(
      { id: AuthModel._id, userType: AuthModel.userType },
      "auth",
      deviceToken
    );

    return next(
      CustomSuccess.createSuccess(
        { ...AuthModel, token },
        "User Logged In Successfull",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { user } = req;

    const AuthModel = (
      await authModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(user._id.toString()) },
        },

        { $limit: 1 },
      ])
    )[0];

    return next(
      CustomSuccess.createSuccess(
        AuthModel,
        "User Information get Successfull",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { error } = forgetpasswordValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { email } = req.body;

    const dataExist = await authModel.findOne({
      email: email,
      isDeleted: false,
    });

    if (!dataExist) {
      return next(CustomError.badRequest("User Not Found"));
    }
    let otp = Math.floor(Math.random() * 90000) + 100000;
    let otpExist = await OtpModel.findOne({ auth: dataExist._id });
    if (otpExist) {
      await OtpModel.findOneAndUpdate(
        { auth: dataExist._id },
        {
          otpKey: await bcrypt.hash(otp.toString(), genSalt),
          reason: "forgetPassword",
          otpUsed: false,
          expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
        }
      );
    } else {
      otpExist = await OtpModel.create({
        auth: dataExist._id,
        otpKey: otp,
        reason: "forgetPassword",
        expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      });
      await otpExist.save();
    }

    await authModel.findOneAndUpdate({ email }, { otp: otpExist._id });
    const emailData = {
      subject: "Section Eight - Account Verification",
      html: `
  <div
    style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
  >
    <img 
          style="
          top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;" 
          src="cid:background" alt="background" 
    />
    <div style="z-index:1; position: relative;">
    <header style="padding-bottom: 20px">
      <div class="logo" style="text-align:center;">
        <img 
          style="width: 300px;" 
          src="cid:logo" alt="logo" />
      </div>
    </header>
    <main 
      style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
    >
      <h1 
        style="color: #a87628; font-size: 30px; font-weight: 700;"
      >Welcome To Section Eight</h1>
      <p
        style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
      >Hi ${dataExist.name},</p>
      <p 
        style="font-size: 20px; text-align: left; font-weight: 500;"
      > Please use the following OTP to reset your password.</p>
      <h2
        style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #a87628; text-align: center; margin-top: 20px; margin-bottom: 20px;"
      >${otp}</h2>
      <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
      style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #a87628;" href = "#"
      >let us know.</a></p>
      <p style = "font-size: 20px;">Regards,</p>
      <p style = "font-size: 20px;">Dev Team</p>
    </main>
    </div>
  <div>
  `,
      attachments: [
        {
          filename: "logo.png",
          path: "./Uploads/logo.png",
          cid: "logo",
          contentDisposition: "inline",
        },
        // {
        //   filename: "bg.png",
        //   path: "./Uploads/bg.png",
        //   cid: "background",
        //   contentDisposition: "inline",
        // },
      ],
    };
    await sendEmails(
      email,
      emailData.subject,
      emailData.html,
      emailData.attachments
    );
    const token = await tokenGen(
      { id: dataExist._id, userType: dataExist.userType },
      "forgetPassword"
    );

    return next(
      CustomSuccess.createSuccess(
        { token, otp },
        "OTP for forgot password is sent to given email",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const VerifyOtp = async (req, res, next) => {
  try {
    if (req.user.tokenType != "forgetPassword") {
      return next(
        CustomError.createError("Token type is not forgot password", 200)
      );
    }

    const { error } = verifyOTPValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }

    const { otp, deviceToken, deviceType } = req.body;
    const { email } = req.user;

    const user = await authModel.findOne({ email }).populate(["otp", "image"]);
    if (!user) {
      return next(CustomError.createError("User not found", 200));
    }
    const OTP = user.otp;
    if (!OTP || OTP.otpUsed) {
      return next(CustomError.createError("OTP not found", 200));
    }

    const userOTP = await bcrypt.hash(otp, genSalt);

    if (OTP.otpKey !== userOTP) {
      return next(CustomError.createError("Invalid OTP", 200));
    }

    const currentTime = new Date();
    const OTPTime = OTP.updatedAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return next(CustomError.createError("OTP expired", 200));
    }
    const device = await linkUserDevice(user._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    const token = await tokenGen(user, "verify otp", deviceToken);

    const bulkOps = [];
    const update = { otpUsed: true, otpKey: null };
    // let  userUpdate ;
    if (OTP._doc.reason !== "forgetPassword") {
      bulkOps.push({
        deleteOne: {
          filter: { _id: OTP._id },
        },
      });
      // userUpdate.OTP = null;
    } else {
      bulkOps.push({
        updateOne: {
          filter: { _id: OTP._id },
          update: { $set: update },
        },
      });
    }
    OtpModel.bulkWrite(bulkOps);
    // AuthModel.updateOne({ identifier: user.identifier }, { $set: userUpdate });
    // user.profile._doc.userType = user.userType;
    // const profile = { ...user.profile._doc, token };
    // delete profile.auth;

    return next(
      CustomSuccess.createSuccess(
        { ...user._doc, token },
        "OTP verified successfully",
        200
      )
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("otp not verify", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

const VerifyPhoneOtp = async (req, res, next) => {
  const { 
    otp , 
    question_id , 
    answer_id,
    answer,
    answers,
    userType
  } = req.body;
  const AuthHeader =
    req.headers.authorization ||
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"];
  if (!AuthHeader) {
    console.log("======>",AuthHeader)
    return next(CustomError.unauthorized());
  }
  const parts = AuthHeader.split(" ");
  
  try {
    if (parts.length !== 2) {
      console.log("======>",parts)
      return next(CustomError.unauthorized());
    }

    const [scheme, token] = parts;
    // token

    // if (!/^Bearer$/i.test(scheme)) {
    //   console.log("===scheme=====>", scheme)
    //   return next(CustomError.unauthorized());
    // }

    const UserToken = await jwt.verify(token,"secret");
    
    const TokenOtp = UserToken?.otp || otp;
  
    if (Number(TokenOtp) === Number(otp)) {
      console.log("TokenOtp" , TokenOtp ,"otp",otp )
      const newUser = await authModel.create(UserToken.userData);
    //   const data = [
    //       {
    //         '$lookup': {
    //           'from': 'answers', 
    //           'localField': 'answer.answer', 
    //           'foreignField': '_id', 
    //           'as': 'answer.answer'
    //         }
    //       }, {
    //         '$unset': [
    //           'answer.answer.userType', 'answer.answer.updatedAt', 'answer.answer.__v'
    //         ]
    //       }, {
    //         '$sort': {
    //           'answer.answer.createdAt': -1
    //         }
    //       }
    //     ]
    //   const checkquestions = await questionModel.aggregate(data)
      
      const answers = await Promise.all(
          answer.map(async (data) => {
            if (data.questionType === "dropdown") {
              return {
                question_id: data.question_id,
                answer_id: data.answer_id,
              };
            } else if (data.questionType === "text") {
              const Data = {
                question_id: data.question_id,
                answer: data.answers,
              };
              const answerd = await answerModel.create(Data);
        
              const answerid = answerd._id.toString();
        
              await questionModel.updateOne(
                { _id: data.question_id },
                {
                  $push: { answer: { answer: answerid } },
                },
                { new: true }
              );
        
              return { Data };
            }
          })
        );


      const Data = {
        auth_id : newUser._id,
        userType,
        answer : answers.map((item) => item)
      }
      const questionAnwser = await userAnswerModel.create(Data) 
      
      const qans = await Promise.all([questionAnwser])
      
    
      
      const [questionAnwsers] = qans
    
      console.log("qans2========>222",qans , questionAnwsers._id)
      
      await authModel.updateOne(
        {_id : newUser._id},
        {$set:{userAnswer : questionAnwsers._id.toString()}},
        {new : true})
        
      const Vtoken = await tokenGen(
        { id: newUser._id, userType: questionAnwser ? questionAnwser.userType : "owner" },
        "auth"
      );

      return next(
        CustomSuccess.createSuccess(
          { token: Vtoken },
          "OTP verified successfullyssss",
          200
        )
      );
    } else {
      return next(CustomError.createError("OTP Not Verified", 200));
    }

    // if (!UserDetail) {
    //   return next(CustomError.unauthorized());
    // }
    // UserDetail.tokenType = UserToken.payload.tokenType;
    // req.user = UserDetail;
    // return next();
  } catch (error) {
    console.log("========++++++", error)
    return next(CustomError.unauthorized());
  }
};

const resetpassword = async (req, res, next) => {
  try {
    if (req.user.tokenType != "verify otp") {
      return next(
        CustomError.createError("First verify otp then reset password", 200)
      );
    }
    const { error } = ResetPasswordValidator.validate(req.body);

    if (error) {
      error.details.map((err) => {
        next(err.message, 200);
      });
    }

    // const { devicetoken } = req.headers;

    const { email } = req.user;
    // if (req.user.devices[req.user.devices.length - 1].deviceToken != devicetoken) {
    //   return next(CustomError.createError("Invalid device access", 200));
    // }

    const updateuser = await authModel.findOneAndUpdate(
      { email },
      {
        password: await bcrypt.hash(req.body.password, genSalt),
        otp: null,
      },
      { new: true }
    );

    // if (!updateuser) {
    //   return next(CustomError.createError("password not reset", 200));
    // }

    const user = await authModel.findOne({ email }).populate("image");
    const token = await tokenGen(user, "auth", req.body.deviceToken);

    const profile = { ...user._doc, token };
    delete profile.password;

    return next(
      CustomSuccess.createSuccess(profile, "password reset succesfully", 200)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("code not send", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};
const logout = async (req, res, next) => {
  try {
    const { deviceType, deviceToken } = req.body;

    unlinkUserDevice(req.user._id, deviceToken, deviceType);
    return next(
      CustomSuccess.createSuccess({}, "User Logout Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 200));
  }
};
const AuthController = {
  verifyuniqueid,
  createProfile: [handleMultipartData.single("file"), createProfile],
  LoginUser,
  updateUser: [
    handleMultipartData.fields([
      { name: "file", maxCount: 1 },
      { name: "coverImageFile", maxCount: 1 },
    ]),
    updateUser,
  ],
  getProfile,
  // changePassword,
  forgetPassword,
  VerifyOtp,
  resetpassword,
  logout,
  SocialLoginUser,
  VerifyPhoneOtp,
  socialLogin
};

export default AuthController;
