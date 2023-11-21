import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import ListingModel from "../DB/Model/listingModel.js";
import UnitAmenitiesModel from "../DB/Model/unitamenitiesModel.js"
import NotificationController from "./NotificationController.js";
import PropertyRequestModel from "../DB/Model/propertyRequestModel.js";
import moment from 'moment';
import mongoose from "mongoose";
import authModel from "../DB/Model/authModel.js";
import fs from "fs";


const createListing = async (req, res, next) => {
  try {
   
    const location = JSON.parse(req.body.location);
    const los_angeles_min_latitude = 33.703400
    const los_angeles_max_latitude = 34.337300
    const los_angeles_max_longitude = -118.668200
    const los_angeles_min_longitude = -118.155300
    const latitude = location[1];
    const longitude = location[0];

 
     
      if (parseFloat(latitude) < parseFloat(los_angeles_min_latitude))
      {  
        return res.status(404).send({
          message: "Location is not located in Los Angeles",
          status: 0
        });
      }else if(parseFloat(latitude) > parseFloat(los_angeles_max_latitude)){
        return res.status(404).send({
          message: "Location is not located in Los Angeles",
          status: 0
        });
      }
      else if(parseFloat(longitude) > parseFloat(los_angeles_min_longitude)){
        return res.status(404).send({
          message: "Location is not located in Los Angeles",
          status: 0
        });
      }
      else if(parseFloat(longitude) < parseFloat(los_angeles_max_longitude)){
        return res.status(404).send({
          message: "Location is not located in Los Angeles",
          status: 0
        });
      }
else{
  console.log("============>")
}
    const { user } = req;
    const {
      title,
      propertyType,
      parkingSlot,
      description,
      budget,
      bedroom,
      bathroom,
      halfBathroom,
      communityBathroom,
      securityDeposit,
      numberOfUnits,
      heatingAvailable,
      coolingAvailable,
      utilityAndAppliance,
      otherUtilityAndAppliance,
      applicationFeeType,
      applicationFee,
      floorUnits,
      wheelchairAccessibleDoorways,
      handicapBathroomRailings,
      wheelchairRamp,
      dateUnit,
      dateunitstatus,
      sizeSqFt,
      furnished,
      Laundry,
      LaundryType,
      Dishwasher,
      garbageDisposal,
      Microwave_Inside_Unit,
      swimmingPool,
      ceilingFans,
      gatedCommunity,
      parking,
      parkingType,
      unitAmenities_status
      // date,
    } = req.body;
    // const ParsedDate = new Date(date);

    let files = [];
    const Datas = {
      file: req.files.map((data) => data.path.replace(/\\/g, "/")),
      fileType: "Listings",
      user: user._id ? user._id : "",
    }
    const filess = await fileUploadModel.create(Datas)

     files.push(filess._id)


   

    if (!req.files || req.files.length === 0) {
      return next(
        CustomError.createError("Please upload at least one file", 400)
      );
    }

    const Data = {
      Laundry,
      LaundryType : Laundry === false ? "none" : LaundryType ,
      Dishwasher,
      garbageDisposal,
      Microwave_Inside_Unit,
      swimmingPool,
      ceilingFans,
      gatedCommunity,
      parking,
      parkingType : parking === false ?  "none" : parkingType,
      creator: user._id,
    }

    const unitAmenitie = await UnitAmenitiesModel.create(Data)

    
const utilityAndAppliances = JSON.parse(utilityAndAppliance);

const fieldData = utilityAndAppliances.map((data) =>( { 
  utilityName1: data.utilityName1,
  fuelType1: data.fuelType1,
  paidBy1: data.paidBy1,
  utilityName2: data.utilityName2,
  fuelType2: data.fuelType2,
  paidBy2: data.paidBy2,
  utilityName3: data.utilityName3,
  fuelType3: data.fuelType3,
  paidBy3: data.paidBy3,
}));
console.log("========>",fieldData)
const otherUtilityAndAppliances = JSON.parse(otherUtilityAndAppliance);

const otherfieldData = otherUtilityAndAppliances.map((data) =>( { 
  otherUtilityName1: data.otherUtilityName1,
  providedBy1: data.providedBy1,
  otherUtilityName2: data.otherUtilityName2,
  providedBy2: data.providedBy2,
  otherUtilityName3: data.otherUtilityName3,
  providedBy3: data.providedBy3,
  otherUtilityName4: data.otherUtilityName4,
  providedBy4: data.providedBy4,
  otherUtilityName5: data.otherUtilityName5,
  providedBy5: data.providedBy5
}));


    const Listing = new ListingModel({
      title,
      location:{
        type: 'Point',
        coordinates: [longitude,latitude]
      },
      propertyType,
      bedroom,
      bathroom,
      sizeSqFt,
      furnished,
      description,
      budget,
      halfBathroom,
      communityBathroom,
      securityDeposit,
      numberOfUnits,
      heatingAvailable,
      coolingAvailable,
      utilityAndAppliance : fieldData,
      otherUtilityAndAppliance : otherfieldData,
      unitAmenities_status,
      unitAmenities : JSON.parse(unitAmenities_status) === true ? unitAmenitie._id : "none",
      applicationFeeType,
      applicationFee : JSON.parse(applicationFeeType) == false ? null  : applicationFee,
      floorUnits,
      wheelchairAccessibleDoorways,
      handicapBathroomRailings,
      wheelchairRamp,
      dateunitstatus,
      dateUnit: dateunitstatus === true ? null :  moment(dateUnit).format('YYYY-MM-DD'),
      creator: user._id,

      files: files,
      parkingSlot,
    });
     await Listing.save();

     return next(CustomSuccess.createSuccess(Listing, "Listing Created", 200));
  } catch (err) {
    console.log("====333=====>",err)
    return next(
      CustomError.createError(
        "Can't Create New Listing Or You are not authorized",
        404
      )
    );
  }
};
const getAllListing = async (req, res, next) => {
  console.log("req.user._id",req.user._id)
  try {
    const data = [
      {
        '$lookup': {
          'from': 'propertyrequests', 
          'let': {
            'listingId': '$_id'
          }, 
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$and': [
                    {
                      '$eq': [
                        '$requesterID', req.user._id
                      ]
                    }, {
                      '$eq': [
                        '$propertyID', '$$listingId'
                      ]
                    }
                  ]
                }
              }
            }
          ], 
          'as': 'propertyData'
        }
      }, {
        '$addFields': {
          'booking': {
            '$cond': {
              'if': {
                '$gt': [
                  {
                    '$size': {
                      '$filter': {
                        'input': '$propertyData', 
                        'cond': {
                          '$eq': [
                            '$$this.status', 'approved'
                          ]
                        }
                      }
                    }
                  }, 0
                ]
              }, 
              'then': true, 
              'else': {
                '$cond': {
                  'if': {
                    '$gt': [
                      {
                        '$size': {
                          '$filter': {
                            'input': '$propertyData', 
                            'cond': {
                              '$ne': [
                                '$$this.status', 'approved'
                              ]
                            }
                          }
                        }
                      }, 0
                    ]
                  }, 
                  'then': false, 
                  'else': 0
                }
              }
            }
          }, 
          'favourite': {
            '$in': [
              '$_id',
       req.user.favourite.map((id) => new mongoose.Types.ObjectId(id)),
            ]
          }
        }
      }, {
        '$lookup': {
          'from': 'fileuploads', 
          'localField': 'files', 
          'foreignField': '_id', 
          'as': 'files'
        }
      }, {
        '$lookup': {
          'from': 'auths', 
          'localField': 'creator', 
          'foreignField': '_id', 
          'as': 'creator'
        }
      }, {
        '$unwind': '$creator'
      }, {
        '$lookup': {
          'from': 'fileuploads', 
          'localField': 'creator.image', 
          'foreignField': '_id', 
          'as': 'creator.image'
        }
      }, {
        '$unwind': {
          'path': '$creator.image', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'unit_amenities', 
          'localField': 'unitAmenities', 
          'foreignField': '_id', 
          'as': 'amenities'
        }
      }, {
        '$unwind': '$amenities'
      }, {
        '$sort': {
          'createdAt': -1
        }
      }
    ]
    // const Listings = await ListingModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "propertyrequests",
    //       let: { listingId: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: {
    //               $and: [
    //                 { $eq: ["$requesterID", req.user._id] },
    //                 { $eq: ["$propertyID", "$$listingId"] },
    //               ],
    //             },
    //           },
    //         },
    //       ],
    //       as: "propertyData",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       booking: {
    //         // $switch: {
    //         //   branches: [
    //         //     {
    //         //       case: { $eq: [{ $size: "$propertyData" }, 0] },
    //         //       then: 0,
    //         //     },
    //         //     {
    //         //       case: { $eq: ["$propertyData.status", "accepted"] },
    //         //       then: true,
    //         //     },
    //         //   ],
    //         //   default: false,
    //         // },
    //         $cond: {
    //           if: {
    //             $gt: [
    //               {
    //                 $size: {
    //                   $filter: {
    //                     input: "$propertyData",
    //                     cond: { $eq: ["$$this.status", "approved"] },
    //                   },
    //                 },
    //               },
    //               0,
    //             ],
    //           },
    //           then: true,
    //           else: {
    //             $cond: {
    //               if: {
    //                 $gt: [
    //                   {
    //                     $size: {
    //                       $filter: {
    //                         input: "$propertyData",
    //                         cond: { $ne: ["$$this.status", "approved"] },
    //                       },
    //                     },
    //                   },
    //                   0,
    //                 ],
    //               },
    //               then: false,
    //               else: 0,
    //             },
    //           },
    //         },
    //       },
    //       favourite: {
    //         $in: [
    //           "$_id",
    //           req.user.favourite.map((id) => new mongoose.Types.ObjectId(id)),
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "fileuploads", // Assuming there's an "ImageModel" collection for images
    //       localField: "files",
    //       foreignField: "_id",
    //       as: "files",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "auths", // Assuming there's an "ImageModel" collection for images
    //       localField: "creator",
    //       foreignField: "_id",
    //       as: "creator",
    //     },
    //   },
       
    //   {
    //     $unwind: "$creator",
    //   },
    //   {
    //     $lookup: {
    //       from: "fileuploads", // Assuming there's an "ImageModel" collection for images
    //       localField: "creator.image",
    //       foreignField: "_id",
    //       as: "creator.image",
    //     },
    //   },
    //   {
    //     $unwind: "$creator.image",
    //   },
    //   {
    //     $lookup: {
    //       from: "unit_amenities", // Assuming there's an "ImageModel" collection for images
    //       localField: "unitAmenities",
    //       foreignField: "_id",
    //       as: "amenities",
    //     },
    //   },
    //   {
    //     $unwind: "$amenities",
    //   },
    //   {
    //     $sort : { "createdAt" : -1 }
    //   }
    //   // {
    //   //   $project: {
    //   //     "creator.image.file": 1, // Include only the "file" field from the image
    //   //     files: 1, // Include the "files" field from the listing
    //   //     // Include other fields you need from the listing
    //   //     // Exclude unnecessary fields if needed
    //   //     // You can also rename fields here if desired
    //   //   },
    //   // },
    // ]);

    const Listings = await ListingModel.aggregate(data)
    return next(
      CustomSuccess.createSuccess(Listings, "Listing Fetched Successfully", 200)
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};

const getSingleProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Listings = await ListingModel.findById(id).populate("files");

    return next(
      CustomSuccess.createSuccess(Listings, "Listing Fetched Successfully", 200)
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const findListing = await ListingModel.findById(id);
    if (!findListing) {
      return next(CustomError.createError("Property not found", 200));
    }
    const Listings = await ListingModel.findByIdAndDelete(id);

    return next(
      CustomSuccess.createSuccess(
        Listings,
        "Property Deleted Successfully",
        200
      )
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};

const updateListing = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;

    let files = [];

    // if (!req.files || req.files.length === 0) {
    //   return next(CustomError.createError("Please upload at least one file", 400));
    // }

    const data = Object.fromEntries(
      Object.entries(req.body).filter(
        ([_, value]) =>
          value !== null && value !== undefined && value !== "" && value !== ""
      )
    );

    const oldListing = await ListingModel.findById(id);

    for (const file of req.files) {
      const fileUpload = new fileUploadModel({
        file: file.filename,
        fileType: "Listings",
        user: user._id ? user._id : "",
      });

      files.push((await fileUpload.save())._id);
    }

    if (typeof req.body.deleteImages == "string") {
      req.body.deleteImages = JSON.parse(req.body.deleteImages);
    }
    if (req.body.deleteImages.length > 0) {
      if (oldListing.files && oldListing.files.length > 0) {
        for (const oldFileId of oldListing.files) {
          if (req.body.deleteImages.includes(oldFileId.toString())) {
            const oldFile = await fileUploadModel.findByIdAndDelete(oldFileId);
            if (oldFile) {
              fs.unlink("Uploads/" + oldFile.file, (err) => {
                if (err) {
                  console.log("Error deleting old file:", err);
                }
              });
            }
          } else {
            files.push(oldFileId);
          }
        }
      }
    } else {
      files = [...files, ...oldListing.files];
    }

    const updatedListing = await ListingModel.findByIdAndUpdate(
      id,
      { files: files, ...data },
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (err) {
    return next(
      CustomError.createError(
        "Can't Update Listing Or You are not authorized",
        404
      )
    );
  }
};

const getOwnListing = async (req, res, next) => {
  try {
    const { user } = req;

    const Listings = await ListingModel.find({
      creator: new mongoose.Types.ObjectId(user._id.toString()),
    })
      .populate({
        path: "files",
      })
      // .populate({
      //   path: "creator",
      //   populate: {
      //     path: "favourite",
      //   },
      // })
      .lean();

    // .map((item) => {
    //   if (user.favourite.includes(new mongoose.Types.ObjectId(item._id))) {
    //     // Object.assign(item, { favourite: true })
    //     item.isfavourite = true;
    //   } else {
    //     // Object.assign(item, { favourite: false })

    //     item.isfavourite = false;
    //   }
    //   return item;
    // });
    // .populate({
    //   path: "creator",
    //   select: {name:1},
    //   populate: { path: "image", select: "file" },
    // })

    return next(
      CustomSuccess.createSuccess(Listings, "Listing Fetched Successfully", 200)
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};

const OwnerHomeListing = async (req, res, next) => {
  try {
    const { user } = req;

    const OwnListings = await ListingModel.find({
      creator: new mongoose.Types.ObjectId(user._id.toString()),
    }).populate("files");
    const AllListings = [...(await ListingModel.find().populate("files")
    .populate({path:"creator",populate:{path:"image"}})
    )].map(
      (item) => {
        if (
          req.user.favourite.includes(new mongoose.Types.ObjectId(item._id))
        ) {
          return {
            ...item._doc,
            isFavourite: true,
          };
        } else {
          return {
            ...item._doc,
            isFavourite: false,
          };
        }
      }
    );

    // const AllListings = [...(await ListingModel.find().populate("files"))].map(
    //   (item) => {
    //     const itemIdString = item._id.toString(); // Convert ObjectId to string
    //     if (req.user.favourite.includes(itemIdString)) {
    //       Object.assign(item, { favourite: true });
    //       item.isFavourite = true;
    //     } else {
    //       Object.assign(item, { favourite: false });
    //       item.isFavourite = false;
    //     }
    //     return item;
    //   }
    // );

    // Filter out listings from AllListings that also exist in OwnListings
    const UniqueAllListings = AllListings.filter(
      (allListing) =>
        !OwnListings.some((ownListing) => ownListing._id.equals(allListing._id))
    );

    return next(
      CustomSuccess.createSuccess(
        { OwnListings, AllListings: UniqueAllListings },
        "Listing Fetched Successfully",
        200
      )
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};

const addTofavourite = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  console.log(user._id);

  try {
    const getFavourite = await ListingModel.findById(id);
    if (!getFavourite) {
      return res.status(200).send("Listing not found");
    }

    const getUser = await authModel.findById(user._id);

    if (getUser.favourite.includes(id)) {
      const addTofavourite = await authModel.findByIdAndUpdate(
        user._id,
        { $pull: { favourite: id } },
        { new: true }
      );
      return next(
        CustomSuccess.createSuccess(
          addTofavourite,
          "Successfully removed from favourite",
          200
        )
      );
    }

    const addTofavourite = await authModel.findByIdAndUpdate(
      user._id,
      { $push: { favourite: id } },
      { new: true }
    );

    if (!addTofavourite) {
      return next(CustomError.createError("Can't add to favourites"));
      if (!addTofavourite) {
        return next(CustomError.createError("Can't remove to favourites"));
      } else {
        return next(
          CustomSuccess.createSuccess(
            addTofavourite,
            "Listing remove to favourites",
            200
          )
        );
      }

      // return res.status(200).send("Already in favourite");
    } else {
      const addTofavourite = await authModel.findByIdAndUpdate(
        user._id,
        { $push: { favourite: id } },
        { new: true }
      );

      const sendnotification = await NotificationController.createNotification({
        type: "Listing",
        title: "Add to favourite",
        description: "Listing has been added to favourite",
        link: "https://example.com/profile",
        user: user._id,
      });

      if (!addTofavourite) {
        return next(CustomError.createError("Can't add to favourites"));
      } else {
        return next(
          CustomSuccess.createSuccess(
            addTofavourite,
            "Listing added to favourites",
            200
          )
        );
      }
    }

    //
    // return next(
    //   CustomSuccess.createSuccess(
    //     sendnotification,
    //     "Listing added to favourites",
    //     200
    //   )
    // );
  } catch (err) {
    return next(CustomError.createError("Listing not found"), 500);
  }
};
const getfavourites = async (req, res, next) => {
  const { user } = req;
  try {
    const getFavorites = await authModel
      .findById(user._id)
      .select("favourite")
      .populate({
        path: "favourite", // Assuming this is the field name for favorite files
        populate: "files", // Assuming this is the field name for files inside favoriteFiles
      });

    return next(
      CustomSuccess.createSuccess(
        getFavorites,
        "Favorites Listing Fetched Successfully",
        200
      )
    );
  } catch (err) {
    return next(CustomError.createError("Error While Fetching Favorites"), 500);
  }
};
// const listingFiteration = async (req, res, next) => {
//   try {
//     req.body = Object.fromEntries(
//       Object.entries(req.body).filter(
//         ([_, value]) =>
//           value !== null &&
//           value !== undefined &&
//           value !== "" &&
//           value !== "" &&
//           value != 0 &&
//           value != "0"
//       )
//     );
//     const { budget, location } = req.body;

//     if (location) {
//       delete req.body.location;
//     }

//     if (budget) {
//       delete req.body.budget;
//       req.body.budget = { $gte: 0, $lte: budget };
//     }

//     const Listings = [
//       ...(await ListingModel.find({
//         ...req.body,
//       })
//         .populate({ path: "files" })
//         .populate({ path: "creator", populate: { path: "image" } })
//         .lean()),
//     ]
//       .filter((item) => {
//         const pattern = new RegExp(location, "i");
//         return pattern.test(item.location);
//       })
//       .map((item) => {
//         if (
//           req.user.favourite.includes(new mongoose.Types.ObjectId(item._id))
//         ) {
//           item.favourite = false;
//         }
//         return item;
//       });

//     return next(
//       CustomSuccess.createSuccess(Listings, "Listing Fetched Successfully", 200)
//     );
//   } catch (err) {
//     console.error(err);
//     return next(CustomError.createError(err.message, 500));
//   }
// };

const getUserListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      CustomError.badRequest("ID is requreid!");
    }
    const user = await authModel.findById(id);
    if (user.userType !== "owner") {
      CustomError.badRequest("You can only view owner!");
    }
    const listings = await ListingModel.find({ creator: id })
      .populate("files")
      .populate({ path: "creator", populate: { path: "image" } });
    return next(
      CustomSuccess.createSuccess(listings, "Listing Fetched Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const listingFiteration = async (req,res,next) => {
  const queryParams = req.body;
  
   const limit = Number(req.query.limit) || 10;
  const offset = Number(req.query.offset) || 1; // Change offset default to 0
  const skip = (offset - 1)  * limit;
  
  try{
    const filter = {};

 



    const filterFields = [
      'propertyType',
      'title',
      'location',
      'communityBathroom',
      'bedroom',
      'bathroom',
      'dateUnit',
      'halfBathroom',
      'numberOfUnits',
      'heatingAvailable',
      'coolingAvailable',
      'utilityAndAppliance.utilityName1',
      'utilityAndAppliance.fuelType1',
      'utilityAndAppliance.paidBy1',
       'utilityAndAppliance.utilityName2',
      'utilityAndAppliance.fuelType2',
      'utilityAndAppliance.paidBy2',
       'utilityAndAppliance.utilityName3',
      'utilityAndAppliance.fuelType3',
      'utilityAndAppliance.paidBy3',
      'otherUtilityAndAppliance.otherUtilityName1',
      'otherUtilityAndAppliance.providedBy1',
       'otherUtilityAndAppliance.otherUtilityName2',
      'otherUtilityAndAppliance.providedBy2',
       'otherUtilityAndAppliance.otherUtilityName3',
      'otherUtilityAndAppliance.providedBy3',
       'otherUtilityAndAppliance.otherUtilityName4',
      'otherUtilityAndAppliance.providedBy4',
       'otherUtilityAndAppliance.otherUtilityName5',
      'otherUtilityAndAppliance.providedBy5',
      'unitAmenities_status',
      'unitAmenities.Laundry',
      'unitAmenities.LaundryType',
      'unitAmenities.Dishwasher',
      'unitAmenities.garbageDisposal',
      'unitAmenities.Microwave_Inside_Unit',
      'unitAmenities.swimmingPool',
      'unitAmenities.ceilingFans',
      'unitAmenities.gatedCommunity',
      'unitAmenities.parking',
      'unitAmenities.parkingType',
    ];

   
    filterFields.forEach((field) => {
      if (queryParams[field] !== undefined) {
        if (queryParams[field] === true) {
          filter[field] = true;
        } else if (queryParams[field] === false) {
          filter[field] = false;
        } else if (!isNaN(queryParams[field])) {
          if (queryParams[field] !== "" && queryParams[field] != 0 && JSON.parse(queryParams[field])) {
            filter[field] = Number(queryParams[field]);
          }
        } else {
          if (queryParams[field] !== "") {
            filter[field] = queryParams[field];
          }
        }
      }
    });

    console.log("filter",filter)
 
    const data = [
      {
        '$lookup': {
          'from': 'unit_amenities',
          'localField': 'unitAmenities',
          'foreignField': '_id',
          'as': 'unitAmenities'
        }
      },
      {
        '$unwind': {
          'path': '$unitAmenities',
          'preserveNullAndEmptyArrays': true
        }
      },
      {
        '$match': {
            $and:[
                {
                    $and: Object.entries(filter).map(([field, value]) => ({
                      [field]: value,
                    }))
                },
                {
                    $or: Object.entries(filter).map(([field, value]) => ({
                      [field]: value,
                    }))
                }
              ]   
        },
      },
      {
        '$project': {
           '_id': 1, 
          'title': 1, 
          'location': 1, 
          'files': 1, 
          'parkingSlot': 1, 
          'description': 1, 
          'budget': 1, 
          'propertyType': 1, 
          'communityBathroom': 1, 
          'bedroom': 1, 
          'bathroom': 1, 
          'halfBathroom': 1, 
          'communityBathroom': 1, 
          'securityDeposit': 1, 
          'numberOfUnits': 1, 
          'dateUnit': 1, 
          'sizeSqFt': 1, 
          'furnished': 1, 
          'heatingAvailable': 1, 
          'coolingAvailable': 1, 
          'unitAmenities_status': 1, 
          'createdAt': 1, 
          'applicationFeeType': 1, 
          'applicationFee': 1, 
          'Amenities': 1, 
          'creator': 1, 
          'unitAmenities.Laundry': 1, 
          'unitAmenities.LaundryType': 1 , 
          'unitAmenities.Dishwasher': 1, 
          'unitAmenities.garbageDisposal': 1, 
          'unitAmenities.Microwave_Inside_Unit': 1, 
          'unitAmenities.swimmingPool': 1, 
          'unitAmenities.ceilingFans': 1, 
          'unitAmenities.gatedCommunity': 1, 
          'unitAmenities.parking': 1, 
          'unitAmenities.parkingType': 1 , 
          'utilityAndAppliance' : 1,
          'otherUtilityAndAppliance' : 1

        }
      },
       {
        '$lookup': {
          'from': 'fileuploads',
          'localField': 'files',
          'foreignField': '_id',
          'as': 'files'
        }
      },
      {
        $addFields:
          /**
           * newField: The new field name.
           * expression: The new field expression.
           */
          {
            utilityAndAppliance: {
              $map: {
                input: "$utilityAndAppliance",
                as: "utlity",
                in: "$$utlity",
              },
            },
          },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          location: 1,
          files: 1,
          parkingSlot: 1,
          description: 1,
          budget: 1,
          propertyType: 1,
          communityBathroom: 1,
          bedroom: 1,
          bathroom: 1,
          halfBathroom: 1,
          securityDeposit: 1,
          numberOfUnits: 1,
          dateUnit: 1,
          sizeSqFt: 1,
          furnished: 1,
          heatingAvailable: 1,
          coolingAvailable: 1,
          unitAmenities_status: 1,
          createdAt: 1,
          applicationFeeType: 1,
          applicationFee: 1,
          Amenities: 1,
          creator: 1,
          "unitAmenities.Laundry": 1,
          "unitAmenities.LaundryType":1,
          "unitAmenities.Dishwasher": 1,
          "unitAmenities.garbageDisposal": 1,
          "unitAmenities.Microwave_Inside_Unit": 1,
          "unitAmenities.swimmingPool": 1,
          "unitAmenities.ceilingFans": 1,
          "unitAmenities.gatedCommunity": 1,
          "unitAmenities.parking": 1,
          "unitAmenities.parkingType": 1,
          "utilityAndAppliance": 1,
          'otherUtilityAndAppliance' : 1
        },
      },
       {
                '$unset': [
                  'files._id', 'files.fileType', 'files.user', 'files.createdAt', 'files.updatedAt', 'files.__v'
                ]
              },
      {
    $limit:
      /**
       * Provide the number of documents to limit.
       */
      limit,
  },
  {
    $skip:
      /**
       * Provide the number of documents to skip.
       */
      skip,
  },
    ];

  

    const filtering = await ListingModel.aggregate(data);
    const fullTotal = await ListingModel.countDocuments();
    //  res.status(200).send(
    //     { total : fullTotal , 
    //     filterTotal : filtering.length  , 
    //     message : "Filter Data " , 
    //     status : 1 ,
    //     data : filtering}
    //     )
    filtering.length == 0 ?
    res.status(200).send({ message : "No Data found in ASAP filter" , status : 1})
    :
    res.status(200).send(
        { total : fullTotal , 
        filterTotal : filtering.length  , 
        message : "Filter Data " , 
        status : 1 ,
        data : filtering}
        )
      
  }catch(err){
    console.log("========>",err)
    res.status(500).send({ message : "not Filter Data " , status : 0})
  }
}

const locationFilter = async (req, res, next) => {
  try {
    const { targetLongitude , targetLatitude , maxDistanceInKilometers } = req.body
   
   
    const option = {
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [targetLongitude, targetLatitude]
          },
          $maxDistance: maxDistanceInKilometers || 5 * 1000 // Convert to meters
        }
      }
    };
    
    const suggestions = await ListingModel.find(option);

    res.status(200).send({
      total : suggestions.length,
      message : "Location fetched successfully",
      status : 1,
      data : suggestions
    })
    
  } catch (err) {
    res.status(200).send({
      message : "Location not found",
      status : 0
    })
  }
}

const getallListing = async (req,res,next) => {
    try{
const data = [
              {
                '$lookup': {
                  'from': 'unit_amenities', 
                  'localField': 'unitAmenities', 
                  'foreignField': '_id', 
                  'as': 'unitAmenities'
                }
              }, {
                '$unwind': {
                  'path': '$unitAmenities', 
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$lookup': {
                  'from': 'fileuploads', 
                  'localField': 'files', 
                  'foreignField': '_id', 
                  'as': 'files'
                }
              }, {
                '$sort': {
                  'createdAt': -1
                }
              }, {
                '$unset': [
                  'files._id', 'files.fileType', 'files.user', 'files.createdAt', 'files.updatedAt', 'files.__v'
                ]
              }
            ]

    const totalLocations = await ListingModel.aggregate(data)
    res.status(200).send({
        total : totalLocations.length,
        message : "All Location Fetched",
        status : 1,
        data : totalLocations
    })
    }catch(err){
      res.status(500).send({
        message : "no Location Fetched",
        status : 0
    })  
    }
}

const ListingController = {
  createListing,
  getSingleProperty,
  deleteProperty,
  updateListing,
  getOwnListing,
  addTofavourite,
  getfavourites,
  listingFiteration,
  getAllListing,
  OwnerHomeListing,
  getUserListingById,
  locationFilter,
  getallListing
};

export default ListingController;
