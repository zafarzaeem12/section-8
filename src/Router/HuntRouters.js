import { Router, application } from "express";
import { AdminMiddleware } from "./Middleware/AuthMiddleware.js";
//import EventController from "../Controller/EventsController.js";
import UploadFilter from "../Utils/filefilter.js";
import HuntController from "../Controller/HuntController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let HuntRouters = Router();

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(HuntRouters);
  this.use(path, middleware, HuntRouters);
  return HuntRouters;
};

HuntRouters.prefix("/user", AuthMiddleware, async function () {  
    HuntRouters.route("/createhunt").post(HuntController.createHunt);
    HuntRouters.route("/joinhunt/:id").patch(HuntController.joinHunt);
    HuntRouters.route("/lefthunt/:id").patch(HuntController.leftHunt);
    HuntRouters.route("/getmyhunts").get(HuntController.getUserHunt);
    

    
  })
HuntRouters.route("/publichunt").get(HuntController.getPublicHunt);
HuntRouters.route("/privatehunt").get(HuntController.getPrivateHunt);

// EventRouters.route("/joinevent/:id").patch(EventController.joinEvent);
// EventRouters.route("/leftevent/:id").patch(EventController.removeUserEvent);
// EventRouters.route("/geteventsbyuser").post(EventController.getAllEventsbyUser);

//EventRouters.route("/getallevents").get(EventController.getEvent);

//EventRouters.prefix("/admin", AdminMiddleware, () => {
  //Events Routes
  //EventRouters.route("/events").get(EventController.getAdminEvent);

//   EventRouters.route("/event")
//     .post(UploadFilter.uploadEvents.single("file"), EventController.createEvent)

    // .get(EventController.getEvent);
//   EventRouters.route("/event/:id")
//     .get(EventController.getSingleEvent)
//     .patch(
//       UploadFilter.uploadEvents.single("file"),
//       EventController.updateEvent
//     )
//     .delete(EventController.deleteEvent);

//  EventRouters.route("/removeuser/:id").patch(EventController.removeUserEvent);
//});
