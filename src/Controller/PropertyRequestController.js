import EventModel from "../DB/Model/eventModel.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import UploadFilter from "../Utils/filefilter.js";
import PropertyRequestModel from "../DB/Model/propertyRequestModel.js";
import NotificationController from "./NotificationController.js";
import mongoose from "mongoose";
import authModel from "../DB/Model/authModel.js";
import ListingModel from "../DB/Model/listingModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";

const sendRequest = async (req, res, next) => {
  try {
    //const EventType = req.path === "/magazine" ? "magazines" : req.path === "/video" ? "videos" : req.path === "/Event" ? "Events" : req.path === "/event" ? "events" :"";
    const { user } = req;
    const { id } = req.params;
    const { name, email, phone, city, description, zip } = req.body;

    const getProperty = await ListingModel.findById(id).populate({
      path: "creator",
      populate: { path: "devices" },
    });
    if (!getProperty) {
      return next(CustomError.createError("Property not found", 400));
    }

    const CheckRequest = await PropertyRequestModel.findOne({
      requesterID: user._id,
      ownerId: getProperty.creator._id,
      propertyID: id,
    });
    if (CheckRequest) {
      return next(CustomError.createError("Request Already Sent", 200));
    }

    getProperty.creator.devices.map((item) => {
      push_notifications({
        deviceToken: item.deviceToken,
        title: user.fullname + " send you a request",
        body: user.fullname + " send you a request for your property",
      });
    });

    const PropertyRequest = await new PropertyRequestModel({
      name,
      email,
      phone,
      city,
      propertyID: id,
      ownerId: getProperty.creator,
      requesterID: user._id,
    });
    await PropertyRequest.save();

    return next(
      CustomSuccess.createSuccess(
        PropertyRequest,
        "PropertyRequest Created",
        200
      )
    );
  } catch (err) {
    console.log(err);
    return next(CustomError.createError("Invalid Property Request", 404));
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    //const EventType = req.path === "/magazine" ? "magazines" : req.path === "/video" ? "videos" : req.path === "/Event" ? "Events" : req.path === "/event" ? "events" :"";
    const { user } = req;
    const { id } = req.params;
    const { requesterID } = req.body;

    const getProperty = await ListingModel.findById(id);
    if (!getProperty) {
      return next(CustomError.createError("Invalid Request", 400));
    }
    const data = await PropertyRequestModel.findOne({
      ownerId: user._id,
      requesterID: new mongoose.Types.ObjectId(requesterID),
      propertyID: id,

      status: "pending",
    }).populate({
      path: "requesterID",
      populate: { path: "devices" },
    });
    data.requesterID.devices.map((item) => {
      push_notifications({
        deviceToken: item.deviceToken,
        title: user.fullname + " Rejected your request",
        body: user.fullname + " Rejected your request for property",
      });
    });
    const CheckRequest = await PropertyRequestModel.findOneAndUpdate(
      data._id,
      {
        ownerId: user._id,
        propertyID: id,
        status: "rejected",
      },
      {
        new: true,
      }
    );
    if (CheckRequest) {
      return next(
        CustomSuccess.createSuccess(
          CheckRequest,
          "Request Rejected Successfully",
          200
        )
      );
    }
  } catch (err) {
    console.log(err);
    return next(CustomError.createError("Invalid Request", 404));
  }
};

const getRequests = async (req, res, next) => {
  try {
    const checkRequest = await ListingModel.aggregate([
      {
        $lookup: {
          from: "propertyrequests",
          localField: "_id",
          foreignField: "propertyID",
          as: "requests",
        },
      },
      {
        $lookup: {
          from: "fileuploads",
          localField: "files",
          foreignField: "_id",
          as: "files",
        },
      },

      {
        $match: {
          creator: req.user._id,
        },
      },
      { $unwind: "$requests" },
      {
        $lookup: {
          from: "auths",
          localField: "requests.requesterID",
          foreignField: "_id",
          as: "requests.requesterID",
        },
      },
      { $unwind: "$requests.requesterID" },
      {
        $lookup: {
          from: "fileuploads",
          localField: "requests.requesterID.image",
          foreignField: "_id",
          as: "requests.requesterID.image",
        },
      },
      {
        $group: {
          _id: "$_id",
          requests: { $addToSet: "$requests" },
          listing: {
            $first: "$title",
          },
          location: { $first: "$location" },
          files: { $first: "$files" },
          propertyType: { $first: "$propertyType" },
          city: { $first: "$city" },
          sectorBlock: { $first: "$sectorBlock" },
          budget: { $first: "$budget" },
          bedroom: { $first: "$bedroom" },
          bathroom: { $first: "$bathroom" },
          sizeSqFt: { $first: "$sizeSqFt" },
          furnished: { $first: "$furnished" },
          creator: { $first: "$creator" },
          date: { $first: "$date" },
          title: { $first: "$title" },
        },
      },

      {
        $project: {
          "files._id": 0,
          "files.fileType": 0,
          "files.user": 0,
          "files.createdAt": 0,
          "files.updatedAt": 0,
          "files.__v": 0,
          // creator: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    return next(
      CustomSuccess.createSuccess(
        checkRequest,
        "Property Requests Fetched Successfully",
        200
      )
    );
  } catch (err) {
    console.log(err);
    return next(CustomError.createError("Invalid Request", 404));
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const { requesterID } = req.body;

    let doc = "";
    const { file } = req;
    if (file) {
      const FileUploadModel = await fileUploadModel.create({
        file: file.filename,
        fileType: file.mimetype,
        user: user._id,
      });

      doc = FileUploadModel._id;
    }
    const getProperty = await ListingModel.findById(id);
    if (!getProperty) {
      return next(CustomError.createError("Cant find Property", 400));
    }

    const findRequest = await PropertyRequestModel.findOne({
      ownerId: user._id,
      requesterID: new mongoose.Types.ObjectId(requesterID),
      propertyID: id,
      status: "pending",
    }).populate({
      path: "requesterID",
      populate: { path: "devices" },
    });

    findRequest?.requesterID?.devices.map((item) => {
      push_notifications({
        deviceToken: item.deviceToken,
        title: user.fullname + " Accepted your request",
        body: user.fullname + " Accepted your request for property",
      });
    });

    if (!findRequest) {
      return next(CustomError.createError("Invalid Request", 400));
    }

    const approvedTo = await PropertyRequestModel.findByIdAndUpdate(
      findRequest._id,
      {
        approvedTo: requesterID,
        file: doc,
        status: "approved",
      },
      { new: true }
    );
    await PropertyRequestModel.updateMany(
      { _id: { $ne: findRequest._id }, propertyID: id },
      {
        status: "rejected",
      }
    );

    if (approvedTo) {
      return next(
        CustomSuccess.createSuccess(
          approvedTo,
          "Property Approved to User",
          200
        )
      );
    }
  } catch (err) {
    //console.error(err);
    console.log(err, "//////////////");
    return next(CustomError.createError(err.message, 500));
  }
};

const getSingleProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const PropertyRequests = await PropertyRequestModel.findById(id).populate(
      "files"
    );

    return next(
      CustomSuccess.createSuccess(
        PropertyRequests,
        "PropertyRequest Fetched Successfully",
        200
      )
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const findPropertyRequest = await PropertyRequestModel.findById(id);
    if (!findPropertyRequest) {
      return next(CustomError.createError("Property not found", 200));
    }
    const PropertyRequests = await PropertyRequestModel.findByIdAndDelete(id);

    return next(
      CustomSuccess.createSuccess(
        PropertyRequests,
        "Property Deleted Successfully",
        200
      )
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};

const updatePropertyRequest = async (req, res, next) => {
  try {
    const { user } = req;
    const PropertyRequestId = req.params.PropertyRequestId; // Assuming the PropertyRequest ID is part of the route parameters

    // ... (other variable declarations and input processing)

    const files = [];

    if (!req.files || req.files.length === 0) {
      return next(
        CustomError.createError("Please upload at least one file", 400)
      );
    }

    // Additional code to remove old PropertyRequest files
    const oldPropertyRequest = await PropertyRequestModel.findById(
      PropertyRequestId
    );
    if (oldPropertyRequest.files && oldPropertyRequest.files.length > 0) {
      for (const oldFileId of oldPropertyRequest.files) {
        const oldFile = await fileUploadModel.findByIdAndDelete(oldFileId);
        if (oldFile) {
          fs.unlink("Uploads/" + oldFile.file, (err) => {
            if (err) {
              console.log("Error deleting old file:", err);
            }
          });
        }
      }
    }

    for (const file of req.files) {
      const fileUpload = new fileUploadModel({
        file: file.filename,
        fileType: "PropertyRequests",
        user: user._id ? user._id : "",
      });

      files.push((await fileUpload.save())._id);
    }

    // ... (updating the PropertyRequest and returning the response)
  } catch (err) {
    console.log(err);
    return next(
      CustomError.createError(
        "Can't Update PropertyRequest Or You are not authorized",
        404
      )
    );
  }
};

const getOwnPropertyRequest = async (req, res, next) => {
  try {
    const { user } = req;

    const PropertyRequests = await PropertyRequestModel.find({
      creator: new mongoose.Types.ObjectId(user._id.toString()),
    }).populate("files");
    // .populate({
    //   path: "creator",
    //   select: {name:1},
    //   populate: { path: "image", select: "file" },
    // })

    return next(
      CustomSuccess.createSuccess(
        PropertyRequests,
        "PropertyRequest Fetched Successfully",
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
    const getFavourite = await PropertyRequestModel.findById(id);
    if (!getFavourite) {
      return res.status(200).send("PropertyRequest not found");
    }

    const getUser = await authModel.findById(user._id);

    if (getUser.favourite.includes(id)) {
      return res.status(200).send("Already in favourite");
    }

    const addTofavourite = await authModel.findByIdAndUpdate(
      user._id,
      { $push: { favourite: id } },
      { new: true }
    );

    if (!addTofavourite) {
      return next(CustomError.createError("Can't add to favourites"));
    }

    const sendnotification = await NotificationController.createNotification({
      type: "PropertyRequest",
      title: "Add to favourite",
      description: "PropertyRequest has been added to favourite",
      link: "https://example.com/profile",
      user: user._id,
    });

    //
    return next(
      CustomSuccess.createSuccess(
        sendnotification,
        "PropertyRequest added to favourites",
        200
      )
    );
  } catch (err) {
    console.log(err);
    return next(CustomError.createError("PropertyRequest not found"), 500);
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
        "Favorites PropertyRequest Fetched Successfully",
        200
      )
    );
  } catch (err) {
    console.log(err);
    return next(CustomError.createError("Error While Fetching Favorites"), 500);
  }
};
const PropertyRequestFiteration = async (req, res, next) => {
  try {
    const {
      propertyType,
      bedroom,
      bathroom,
      furnished,
      budget, // Assuming budget is an object with min and max properties
      location,
    } = req.body;

    // Constructing the query object based on the provided filters
    const query = {};

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (bedroom) {
      query.bedroom = bedroom;
    }

    if (bathroom) {
      query.bathroom = bathroom;
    }

    if (furnished !== undefined) {
      query.furnished = furnished;
    }

    if (location) {
      query.location = location;
    }

    if (budget && budget.min !== undefined && budget.max !== undefined) {
      query.budget = { $gte: budget.min, $lte: budget.max };
    }

    const PropertyRequests = await PropertyRequestModel.find(query).populate(
      "files"
    );

    return next(
      CustomSuccess.createSuccess(
        PropertyRequests,
        "PropertyRequest Fetched Successfully",
        200
      )
    );
  } catch (err) {
    console.error(err);
    return next(CustomError.createError(err.message, 500));
  }
};

//export default router;

const PropertyRequestController = {
  sendRequest,
  rejectRequest,
  getRequests,
  acceptRequest: [handleMultipartData.single("file"), acceptRequest],
};

export default PropertyRequestController;
