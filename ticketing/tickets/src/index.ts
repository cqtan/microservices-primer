import "express-async-errors"; // enables throws to occur in promises as well
import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  // Make sure that we actually have a secret key for JWT right from the beginning
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY not defined!!");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not defined!!");
  }

  try {
    // await mongoose.connect("mongodb://localhost") // we use instance in Pods instead!
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, () => {
  console.log("Listening on port 3000 (tickets)");
});

start();
