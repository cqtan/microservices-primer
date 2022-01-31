import express from "express";
import "express-async-errors"; // enables throws to occur in promises as well
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@cqtickets/common";

const app = express();
app.set("trust proxy", true); // Since we proxy data through Ingress
app.use(json());
app.use(
  cookieSession({
    signed: false, // No need to encrypt since JWT does that for use already
    secure: process.env.NODE_ENV !== "test", // Only Https except for tests
  })
);

// After all the routes and request methods not matching
// Throws even though its async because of express-async-errors
// express-async-errors: might not be needed in Express v5
app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
