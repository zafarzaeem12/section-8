import fs from "fs"
import { createServer} from "https";
// import { createServer } from "http";
import { app } from "./appsub.js";
import { realTime_Socket } from './Utils/realTime_Socket.js'
// const httpServer = createServer(app);
import { Server } from 'socket.io';


// httpServer.listen(port, async () => {
//   console.log("Server listening on port " + port);
// });
const port = process.env.PORT || 3080;
const httpsServer = createServer(
  {
    key: fs.readFileSync(
      "/home/section8api/ssl/keys/c7ca8_f5ad1_9a5a06cfe6f1d69e42c61ed39f9bdbbc.key",
    ),
    cert: fs.readFileSync(
      "/home/section8api/ssl/certs/section8_api_thesuitchstaging_com_c7ca8_f5ad1_1699315199_b5216e18e01f70eb3758bcb561fceb39.crt",
    ),
    ca: fs.readFileSync("/home/section8api/ssl/certs/ca.crt"),
  },
  app,
);
const io = new Server(httpsServer);
realTime_Socket(io);

httpsServer.listen(port, async () => {
  console.log("Server listening on port " + port);
});
