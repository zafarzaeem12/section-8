import mongoose from "mongoose";

const UnitAmenitiesSchema = mongoose.Schema(
  {
     Laundry:{
      type: Boolean,
      required : false
    },
    LaundryType : {
        type : String,
        enum : [
            "Washer/Dryer Hook-ups inside Unit Only",
            "Washer Provided inside Unit Only" , 
            "Dryer Provided inside Unit Only" , 
            "Washer/Dryer Provided Onsite" , 
            "Onsite Community Laundry",
            "none"
            ],
            default : "none"
      },
      Dishwasher :{
        type: Boolean,
        required : false
      },
      garbageDisposal :{
        type: Boolean,
        required : false
      },
      Microwave_Inside_Unit :{
        type: Boolean,
        required : false
      },
      swimmingPool :{
        type: Boolean,
        required : false
      },
      ceilingFans :{
        type: Boolean,
        required : false
      },
      gatedCommunity :{
        type: Boolean,
        required : false
      },
      parking:{
        type: Boolean,
        required : false
      },
      parkingType : {
        type : String,
        enum : [
            "one-carPort",
            "two-carPort" , 
            "one-carGarage" , 
            "two-carGarage" , 
            "three-carGarage" ,
            "assigned",
            "unAssigned",
            "one-space",
            "two-spaces",
            "three-plus- spaces",
            "street",
            "covered",
            "open",
            "driveway",
            "none"
            ]
      },
    
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
  },
  {
    timestamps: true,
  }
);

const UnitAmenitiesModel = mongoose.model("Unit_Amenities", UnitAmenitiesSchema);

export default UnitAmenitiesModel;
