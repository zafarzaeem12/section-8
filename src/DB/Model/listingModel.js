import mongoose from "mongoose";

const ListingSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default : 'Point'
      },
      coordinates: [Number] 
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "fileUpload",
      },
    ],

    parkingSlot: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    budget: {
      type: Number,
      required: true,
    },

    bedroom: {
      type: Number,
      required: false,
    },
    bathroom: {
      type: Number,
      required: false,
    },
    halfBathroom: {
      type: Number,
      required: false,
    },
    communityBathroom: {
      type: Number,
      required: false,
    },
    securityDeposit: {
      type: Number,
      required: false,
    },
    numberOfUnits:{
      type: Number,
      required : false
    },
    dateunitstatus:{
      type: Boolean,
      default : true
    },
    dateUnit:{
      type: String
    },
    heatingAvailable:{
      type: Boolean,
      required : false
    },
    coolingAvailable:{
      type: Boolean,
      required : false
    },
    sizeSqFt: {
      type: String,
      required: false,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    propertyType : {
      type : String,
      enum : [
      "house",
      "duplex", 
      "manufactured-home" , 
      "townhouse" , 
      "condominium" , 
      "mobile-space" , 
      "low-rise" , 
      "high-rise" , 
      "single room occupancy"
    ]
    },

    utilityAndAppliance: [
      {
        utilityName1: {
          type: String,
          required: true,
        },
        fuelType1: {
          type: String,
          enum: ["naturalGas", "electric", "none"],
          default: "none",
          required: true,
        },
        paidBy1: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
         utilityName2: {
          type: String,
          required: true,
        },
        fuelType2: {
          type: String,
          enum: ["naturalGas", "electric", "none"],
          default: "none",
          required: true,
        },
        paidBy2: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
         utilityName3: {
          type: String,
          required: true,
        },
        fuelType3: {
          type: String,
          enum: ["naturalGas", "electric", "none"],
          default: "none",
          required: true,
        },
        paidBy3: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
      },
    ],
    otherUtilityAndAppliance:[
      {
        otherUtilityName1: {
          type: String,
          required: true,
        },
        providedBy1: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
        otherUtilityName2: {
          type: String,
          required: true,
        },
        providedBy2: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
        otherUtilityName3: {
          type: String,
          required: true,
        },
        providedBy3: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
        otherUtilityName4: {
          type: String,
          required: true,
        },
        providedBy4: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
        otherUtilityName5: {
          type: String,
          required: true,
        },
        providedBy5: {
          type: String,
          enum: ["tenant", "owner"],
          default: "tenant",
          required: true,
        },
      }
    ],
    unitAmenities_status:{
      type : Boolean,
      default : true
    },

    unitAmenities: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Unit_Amenities",
    },

    applicationFeeType:{
      type : Boolean,
      required: true
    },
    applicationFee:{
      type : Number,
      default : 0
    },
    // Amenities : {
    //   type : String,
    //   enum : [
    //   "1st Floor Units",
    //   "Wheelchair Accessible Doorways", 
    //   "Handicap Bathroom Railings " , 
    //   "Wheelchair Ramp"
    // ],
    // default : "none"
    // },
    floorUnits:{
      type : Number
    },
    wheelchairAccessibleDoorways:{
      type : Boolean
    },
    handicapBathroomRailings:{
      type : Boolean
    },
    wheelchairRamp:{
      type : Boolean
    },
    rate: { type: Number },


    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
  },
  {
    timestamps: true,
  },
);

ListingSchema.index({ location: '2dsphere' });

const ListingModel = mongoose.model("listing", ListingSchema);

export default ListingModel;
