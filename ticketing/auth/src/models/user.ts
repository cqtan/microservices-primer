import mongoose from "mongoose";
import { Password } from "../services/password";

interface UserAttrs {
  email: string;
  password: string;
}

// interface UserModel extends mongoose.Model<UserDoc> {
//   build(attrs: UserAttrs): UserDoc;
// }

// interface UserDoc extends mongoose.Document {
//   email: string;
//   password: string;
// }

type UserDoc = mongoose.Document & UserAttrs;

const userSchema = new mongoose.Schema<UserDoc>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // called when sending data back as JSON response
      transform(doc, ret) {
        ret.id = ret._id; // renaming "_id" to "id" for consistency
        delete ret._id;
        delete ret.password; // we don't want to return password
        delete ret.__v; // this version id is unnecessary, removed as well
      },
    },
  }
);

// Mongoose built-in pre-hook that triggers before a specific event, e.g. save
// Also triggers upon creation of a Document, e.g. new User(...)
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

// Pattern to give Mongoose type-checking
// userSchema.statics.build = (attrs: UserAttrs) => {
//   return new User(attrs);
// };

const UserModel = mongoose.model<UserDoc>("User", userSchema);

// Instead of using statics, we go class-based
class User extends UserModel {
  constructor(attrs: UserAttrs) {
    super(attrs);
  }
}

// Option 1: Add methods to existing
// const user = User.build({
//   email: "test@test.com",
//   password: "5678903e2",
// });

// Option 2
// const user = new User({
//   email: "test@test.com",
//   password: "567890987",
// });

export { User };
