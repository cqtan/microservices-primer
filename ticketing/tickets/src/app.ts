import express from "express";
import "express-async-errors"; // enables throws to occur in promises as well
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@cqtickets/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

const app = express();
app.set("trust proxy", true); // Since we proxy data through Ingress
app.use(json());
app.use(
  cookieSession({
    signed: false, // No need to encrypt since JWT does that for use already
    secure: process.env.NODE_ENV !== "test", // Only Https except for tests
  })
);
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

// After all the routes and request methods not matching
// Throws even though its async because of express-async-errors
// express-async-errors: might not be needed in Express v5
app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
