import express from "express";
import "express-async-errors"; // enables throws to occur in promises as well
import { json } from "body-parser";
import mongoose from "mongoose";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();
app.set("trust proxy", true); // Since we proxy data through Ingress
app.use(json());
app.use(
  cookieSession({
    signed: false, // No need to encrypt since JWT does that for use already
    secure: true, // Only Https
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// After all the routes and request methods not matching
// Throws even though its async because of express-async-errors
// express-async-errors: might not be needed in Express v5
app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  try {
    // await mongoose.connect("mongodb://localhost") // we use instance in Pods instead!
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, () => {
  console.log("Listening on port 3000!!!!!!!!");
});

start();
