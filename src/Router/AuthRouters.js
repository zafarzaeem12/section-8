import { Router, application } from "express";
import AuthController from "../Controller/AuthController.js";
import ListingController from "../Controller/ListingController.js";
import UploadFilter from "../Utils/filefilter.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
import PropertyRequestController from "../Controller/PropertyRequestController.js";

export let AuthRouters = Router();

// AuthRouters.route("/register").post(AuthController.registerUser);

AuthRouters.route("/createprofile").post(AuthController.createProfile);
AuthRouters.route("/login").post(AuthController.LoginUser);
AuthRouters.route("/sociallogin").post(AuthController.socialLogin);
AuthRouters.route("/forgetpassword").post(AuthController.forgetPassword);
//AuthRouters.route("/sociallogin").post(AuthController.socialLogin);
AuthRouters.route("/verifyphoneotp").post(AuthController.VerifyPhoneOtp);



application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(AuthRouters);
  this.use(path, middleware, AuthRouters);
  return AuthRouters;
};

AuthRouters.prefix("/user", AuthMiddleware, async function () {
  AuthRouters.route("/update").post(AuthController.updateUser);
  AuthRouters.route("/sendrequest/:id").post(
    PropertyRequestController.sendRequest
  );
  AuthRouters.route("/rejectrequest/:id").delete(
    PropertyRequestController.rejectRequest
  );
  AuthRouters.route("/getrequests/").get(PropertyRequestController.getRequests);
  AuthRouters.route("/acceptrequest/:id").post(
    PropertyRequestController.acceptRequest
  );

  AuthRouters.route("/updatelisting/:id").post(
    UploadFilter.uploadListing.array("files"),
    ListingController.updateListing
  );
  AuthRouters.route("/ownerhomelisting").get(
    ListingController.OwnerHomeListing
  );
  AuthRouters.route("/createlisting").post(
    UploadFilter.uploadListing.array("files"),
    ListingController.createListing
  );
  AuthRouters.route("/getownListing").get(ListingController.getOwnListing);
  AuthRouters.route("/addfavourite/:id").post(ListingController.addTofavourite);
  AuthRouters.route("/getfavourites").get(ListingController.getfavourites);

  AuthRouters.route("/getprofile").get(AuthController.getProfile);
  AuthRouters.route("/resetpassword").post(AuthController.resetpassword);
  AuthRouters.route("/Verify").post(AuthController.VerifyOtp);
  AuthRouters.route("/logout").post(AuthController.logout);
});
