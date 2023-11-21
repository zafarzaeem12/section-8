import { Router, application } from "express";
import ListingController from "../Controller/ListingController.js";
import UploadFilter from "../Utils/filefilter.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let ListingRouters = Router();

// ListingRouters.route("/register").post(AuthController.registerUser);

 ListingRouters.route("/alllisting").get(ListingController.getallListing);
 
 ListingRouters.route("/filter").post(ListingController.listingFiteration);
  ListingRouters.route("/filterlocation").post(ListingController.locationFilter);

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(ListingRouters);
  this.use(path, middleware, ListingRouters);
  return ListingRouters;
};

 

ListingRouters.prefix("/listing", AuthMiddleware, async function () {
  ListingRouters.route("/getalllisting").get(ListingController.getAllListing);
  ListingRouters.route("/getsingle/:id").get(
    ListingController.getSingleProperty
  );
  ListingRouters.route("/deletelisting/:id").delete(
    ListingController.deleteProperty
  );
  ListingRouters.route("/updatelisting/:id").put(
    UploadFilter.uploadListing.array("files"),
    ListingController.updateListing
  );
  
  
});

ListingRouters.route("/ownerlisting/:id").get(ListingController.getUserListingById);
