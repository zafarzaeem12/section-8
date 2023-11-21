// var FCM = require("fcm-node");
import FCM from "fcm-node";
var serverKey = "AAAAHeVKNvw:APA91bFKYv2MBLk0i9T2RRPJnfss_-k6KGa-7Sdhbc66DsdSw764qA8hfcsMk2xziT3TBVLveyTSBfuG65BG98xJQW89h3BuGvanXjO-_aw8vJSubQG_cLaOj1c1zrQXjztAWKQS0Sfm"
var fcm = new FCM(serverKey);

const push_notifications = (notification_obj) => {
  console.log(notification_obj);
  var message = {
    to: notification_obj.deviceToken,
    collapse_key: "your_collapse_key",

    notification: {
      title: notification_obj.title,
      body: notification_obj.body,
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("error", err);
    } else {
      console.log("response", response);
    }
  });
};

// module.exports = { push_notifications };
export default push_notifications;
