import { Router, application } from "express";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import UserController from "../Controller/UserController.js";
import CallController from '../Controller/CallController.js';
export const UserRouters = Router();

// Define the route for creating a new contact form entry

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(UserRouters);
  this.use(path, middleware, UserRouters);
  return UserRouters;
};

UserRouters.prefix("/user", AuthMiddleware, async function () {
  UserRouters.route("/reviews").post(UserController.createReview);
  UserRouters.route("/notifications").get(UserController.getAllNotifications);
  UserRouters.route('/create-call').post(CallController.Calling_Start)
  UserRouters.route('/getallcall').get(CallController.get_Call_Record)
  UserRouters.route('/deletecall/:id').delete(CallController.delete_Call_Record)

  //UserRouters.route("/contact").post(UserController.createContactForm)
  // EventRouters.route("/event")
  // .post(UploadFilter.uploadEvents.single("file"), EventController.createEvent)

  // HuntRouters.route("/createhunt").post(
  //   UploadFilter.uploadEvents.single("file"),
  //   HuntController.createHunt
  // );
});

UserRouters.route("/profiles/:id").get(UserController.getProfileWithReviews);
UserRouters.route("/reviews/:id").get(UserController.getReview);