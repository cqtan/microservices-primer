import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";
import { User } from "../models/user";
// import { DatabaseConnectionError } from "../errors/database-connection-error";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters!"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //   return res.status(400).send(errors.array()); // sends: [...] instead of { errors: [...] }

      //   throw new Error("Invalid email or password!");
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Email aleady in use!");
      return res.send({});
    }

    console.log("Creating a user...");

    const user = new User({ email, password });
    await user.save();

    res.status(201).send(user);

    // Mocking DB down
    // throw new Error("Error connecting to DB");
    // throw new DatabaseConnectionError(errors.array());
    // return res.send({});
  }
);

export { router as signupRouter };
