import express, { Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../errors/bad-custom-error";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { validateRequest } from "../middlewares/validate-requests";
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
  validateRequest,
  async (req: Request, res: Response) => {
    // Using validateRequest() middleware instead
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   //   return res.status(400).send(errors.array()); // sends: [...] instead of { errors: [...] }

    //   //   throw new Error("Invalid email or password!");
    //   throw new RequestValidationError(errors.array());
    // }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email already in use!");
    }

    console.log("Creating a user...");

    const user = new User({ email, password });
    await user.save(); // See pre-hook in /services/password for hashing

    // Generate JWT (sync)
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      // "asdf"
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);

    res.status(201).send(user);

    // Mocking DB down
    // throw new Error("Error connecting to DB");
    // throw new DatabaseConnectionError(errors.array());
    // return res.send({});
  }
);

export { router as signupRouter };
