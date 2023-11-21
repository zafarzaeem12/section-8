// Librarys
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import morganBody from "morgan-body";
import path,{ dirname } from 'path';
import fs from "fs";

import { fileURLToPath } from "url";
// DB Connection
import { connectDB } from "./DB/index.js";
// Routes
import { AuthRouters } from "./Router/AuthRouters.js";
import { ListingRouters } from "./Router/ListingRouters.js";
import { UserRouters } from "./Router/UserRouter.js";
import { OwnerRouters } from "./Router/OwnerRouters.js";
// Response Handler
import { AdminRouters } from "./Router/AdminRouters.js";

import { ResHandler } from "./Utils/ResponseHandler/ResHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const imageDirectory = path.join(__dirname, 'Uploads'); 
export let app = express();

const API_PreFix = "/api/v1";

app.use('/Uploads', express.static(imageDirectory));
var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
// Configure body-parser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

morganBody(app, {
  prettify: true,
  logReqUserAgent: true,
  logReqDateTime: true,
});
// Connect To Database
connectDB();
// Running Seeder
// RunSeeder();

// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to the application." });
// });
// Routes
app.use(API_PreFix, AuthRouters);
// ====// Bussiness Routes

// Route For  Business and Worker
app.use(API_PreFix, AdminRouters);

//app.use(API_PreFix, UserRouters);

// Listing Routes
app.use(API_PreFix, ListingRouters);
//OWNER ROUTERS
// app.use(API_PreFix,OwnerRouters)

app.use(API_PreFix, UserRouters);

app.use(API_PreFix, OwnerRouters);

app.use(ResHandler);
