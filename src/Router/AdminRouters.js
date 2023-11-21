import { Router, application } from "express";
import { AdminMiddleware } from "./Middleware/AuthMiddleware.js";
import AdminController from "../Controller/AdminController.js";
import AuthController from "../Controller/AuthController.js";
import UserController from "../Controller/UserController.js";

export let AdminRouters = Router();

AdminRouters.route("/getallusers").get(AdminController.getAllUsers);
application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(AdminRouters);
  this.use(path, middleware, AdminRouters);
  return AdminRouters;
};

//const contentController = require("../controllers/contentController");

//router.post("/", contentController.upload.single("file"), contentController.createContent);

AdminRouters.prefix("/admin", AdminMiddleware, () => {
  AdminRouters.route("/addcategory").post(AdminController.createCategory);
  AdminRouters.route('/addquestion').post(AdminController.createQuestions);
  AdminRouters.route('/addanswer').post(AdminController.Answerquestions);
//   AdminRouters.route('/addunits').post(AdminController.createNoofunits);
  AdminRouters.route("/deleteuser/:id").patch(AdminController.deleteUser);
  AdminRouters.route("/sendNotification").post(
    AdminController.SendNotification
  );
  AdminRouters.route("/getusers").get(AdminController.getAllUsers);
  AdminRouters.route("/filteruser").get(AdminController.filterUser);
  AdminRouters.route("/blockuser/:id").patch(AdminController.blockUser);
  AdminRouters.route("/edituser/:id").patch(AdminController.editUser);
  AdminRouters.route("/getRequests").get(AdminController.getRequests);
  AdminRouters.route("/updaterequest/:id").patch(AdminController.updateRequest);
  AdminRouters.route("/deleterequest/:id").patch(AdminController.deleteRequest);
  AdminRouters.route("/getproperties").get(AdminController.getProperties);
  AdminRouters.route("/updateproperty/:id").patch(
    AdminController.updateProperty
  );
  AdminRouters.route("/deleteproperty/:id").patch(
    AdminController.deleteProperty
  );
  AdminRouters.route("/getreviews").get(AdminController.getReviews);
  AdminRouters.route("/updatereview/:id").patch(AdminController.updateReview);
  AdminRouters.route("/deletereview/:id").patch(AdminController.deleteReview);
  AdminRouters.route("/terms").post(AdminController.createTerms);
  AdminRouters.route("/terms").delete(AdminController.deleteTerms);
  AdminRouters.route("/privacy").post(AdminController.createPrivacy);
  AdminRouters.route("/privacy").delete(AdminController.deletePrivacy);
  AdminRouters.route("/about").post(AdminController.createAbout);
  AdminRouters.route("/about").delete(AdminController.deleteAbout);
});

AdminRouters.route("/category").get(AdminController.getAllCategories);
AdminRouters.route("/terms").get(AdminController.getTerms);
AdminRouters.route("/privacy").get(AdminController.getPrivacy);
AdminRouters.route("/about").get(AdminController.getAbout);

// AdminRouters.route("/getunits").get(AdminController.getallUnits);
AdminRouters.route("/getquestion").get(AdminController.getallAnswer);
