import mongoose from "mongoose";
import { hashPassword } from "../../Utils/SecuringPassword.js";

const AuthSchema = mongoose.Schema(
  {
    answer:[
        {
            questionType:{
                    type:String,
                    enum : ["dropdown","text"]
                },
            question_id:{
                  type : mongoose.Schema.Types.ObjectId,
                  ref : 'question'
            },
            answer_id:{
                  type : mongoose.Schema.Types.ObjectId,
                  ref : 'answer',
                  default : ""
            },
            answers:{
                type : String,
                default : ""
            }
        }
        ],
        
        userAnswer:{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'useranswer',
        },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    bio: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      required: false,
      //unique: true,
    },
    address: {
      type: String,
      trim: true,
      required: false,
      default:"los_anglos"
      //unique: true,
    },
    fullname: {
      type: String,
      required: false,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default : 'Point'
      },
      coordinates: [Number] 
    },
    anwserid: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "fileUpload",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "fileUpload",
    },
    userType: {
      type: String,
      enum: ["owner", "tenant", "admin"],
      //required: true,
    },
    rate: { type: Number },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    notificationOn: {
      type: Boolean,
      default: true,
    },
    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "device",
      },
    ],

    otp: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "otp",
      default: null,
    },
    facebookId: {
      type: String,
      trim: true,
    },
    instgramId: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    favourite: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "listing",
      },
    ],
    coverImage: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "fileUpload",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Review",
      },
    ],
    socialLogin :{
      type : String,
      enum : ["google","facebook","apple"]
    }
  },

  {
    timestamps: true,
  }
);
// AuthSchema.pre("update", function (next) {
//   // do something
//   console.log(this.isModified('password'));
//   if (!this.isModified('password')) return next();
//   this.password = hashPassword(this.password);

//   next(); //dont forget next();
// });
AuthSchema.index({ coordinates: "2dsphere" });
const authModel = mongoose.model("auth", AuthSchema);
export default authModel;
