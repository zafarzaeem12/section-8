import { Router, application } from "express";
import AuthController from "../Controller/AuthController.js";
import ListingController from "../Controller/ListingController.js";
import UserController from "../Controller/UserController.js";
import PropertyRequestController from "../Controller/PropertyRequestController.js";

import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let OwnerRouters = Router();

// OwnerRouters.route("/register").post(AuthController.registerUser);

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(OwnerRouters);
  this.use(path, middleware, OwnerRouters);
  return OwnerRouters;
};

OwnerRouters.prefix("/owner", AuthMiddleware, async function () {
  OwnerRouters.route("/createlisting").post(ListingController.createListing);
  OwnerRouters.route("/reviews/:id").patch(UserController.replyToReview);
  OwnerRouters.route("/getrequests").get(PropertyRequestController.getRequests);
  OwnerRouters.route("/acceptrequest/:id").patch(PropertyRequestController.acceptRequest);
  OwnerRouters.route("/rejectrequest/:id").patch(PropertyRequestController.rejectRequest);
});
