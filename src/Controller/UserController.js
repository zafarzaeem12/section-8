import ContactFormModel from "../DB/Model/contactFormModel.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import authModel from "../DB/Model/authModel.js";
import Review from "../DB/Model/reviewModel.js";
import NotificationModel from "../DB/Model/notificationModal.js";
import ListingModel from "../DB/Model/listingModel.js";
import {
  formValidator,
  reviewValidator,
} from "../Utils/Validator/UserValidator.js";
import mongoose from "mongoose";

import PropertyRequestModel from "../DB/Model/propertyRequestModel.js";

const createContactForm = async (req, res, next) => {
  try {
    const { error } = formValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { email, name, phone, message } = req.body;
    const { user } = req;
    const contactForm = new ContactFormModel({
      email: email,
      name: name,
      phone: phone,
      message: message,
      user: user._id,
    });

    await contactForm.save();

    return next(
      CustomSuccess.createSuccess(
        contactForm,
        "Form Submitted Successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const viewContactForm = async (req, res, next) => {
  try {
    const contactform = await ContactFormModel.find({});
    return next(
      CustomSuccess.createSuccess(contactform, "Form Get Successfully", 200)
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const viewContactFormbyUID = async (req, res, next) => {
  try {
    const userId = req.params.id; // Assuming req.user contains the user object with the ObjectId

    const contactForms = await ContactFormModel.find({ user: userId });

    if (!contactForms) {
      return next(
        CustomError.createError("No contact forms found for the user", 404)
      );
    }

    return next(
      CustomSuccess.createSuccess(
        contactForms,
        "Contact forms retrieved successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const viewContactFormbyMonth = async (req, res, next) => {
  try {
    const month = req.body.month; // Assuming the month is provided as a query parameter

    const contactForms = await ContactFormModel.find({
      createdAt: {
        $gte: new Date(month),
        $lt: new Date(month).setMonth(new Date(month).getMonth() + 1),
      },
    });

    if (!contactForms) {
      return next(
        CustomError.createError(
          "No contact forms found for the specified month",
          404
        )
      );
    }

    return next(
      CustomSuccess.createSuccess(
        contactForms,
        "Contact forms retrieved successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const deleteContactForm = async (req, res, next) => {
  try {
    const content = await ContactFormModel.findByIdAndRemove(req.params.id);
    if (!content) {
      return next(
        CustomError.createError(
          "Contact Form not found or you are not authorized to delete this Form",
          404
        )
      );
    }
    return next(
      CustomSuccess.createSuccess({}, "Contact Form deleted successfully", 200)
    );
  } catch (err) {
    return next(CustomError.badRequest("Content ID is invalid"));
  }
};

const getProfileWithReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const profileWithReviews = await authModel.findById(id).populate({
      path: "reviews",
      populate: { path: "user2", populate: { path: "image" } },
    });
    return next(
      CustomSuccess.createSuccess(
        profileWithReviews,
        "Profile with reviews found successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const review = await Review.findById(id).populate({
      path: "user2",
      populate: { path: "image" },
    });
    return next(
      CustomSuccess.createSuccess(review, "Review found successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    if (!id) {
      return next(CustomError.badRequest("ID is requred!"));
    }
    const updateReview = await Review.findByIdAndUpdate(
      id,
      {
        $set: { reply },
      },
      { new: true }
    );
    next(
      CustomSuccess.createSuccess(
        updateReview,
        "Review updated successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const createReview = async (req, res, next) => {
  try {
    const { error } = reviewValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { propertyID, message, rating } = req.body;
    const { user } = req;
    // const owner = await authModel.findById(user);
    // if (!owner || owner.userType !== "owner") {
    //   return next(CustomError.badRequest("You cannot review this profile!"));
    // }
    console.log(user._id);
    const requestAccepted = await PropertyRequestModel.find({
      propertyID,
      requesterID: user._id,
      status: "approved",
    });
    if (requestAccepted.length == 0) {
      return next(CustomError.badRequest("Not eligible for providing review"));
    }
    // const existing = await Review.findOne({ propertyID, user: user._id });
    // if (existing) {
    //   return next(
    //     CustomError.badRequest("You cannot review again this profile!")
    //   );
    // }
    const createReview = new Review({
      propertyID,
      message,
      rating,
      user: user._id,
    });
    const result = await createReview.save();

    const rate = await Review.aggregate([
      {
        $match: {
          propertyID: new mongoose.Types.ObjectId(propertyID), // Filter documents where userID is 1
        },
      },
      {
        $group: {
          // Group all filtered documents together
          _id: null,
          avgRating: { $avg: "$rating" }, // Calculate the average of the "count" field
        },
      },
    ]);
    console.log(rate);
    await ListingModel.updateOne(
      { _id: propertyID },
      { rate: rate[0].avgRating }
    );
    return next(
      CustomSuccess.createSuccess(
        createReview,
        "Review created successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const { id } = user;
    const getAllNotifications = await NotificationModel.find({ user: id }).sort(
      {
        createdAt: -1,
      }
    );
    return next(
      CustomSuccess.createSuccess(
        getAllNotifications,
        "Review created successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const UserController = {
  createContactForm,
  viewContactForm,
  viewContactFormbyUID,
  viewContactFormbyMonth,
  deleteContactForm,
  getProfileWithReviews,
  getReview,
  replyToReview,
  createReview,
  getAllNotifications,
};

export default UserController;
