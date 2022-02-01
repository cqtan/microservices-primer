import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor() {
    super("Route not found (super)");

    Object.setPrototypeOf(this, new.target.prototype);
  }

  serializeErrors() {
    return [{ message: "Not Found" }];
  }
}
