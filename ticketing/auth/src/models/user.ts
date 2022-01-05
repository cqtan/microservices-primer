import mongoose from "mongoose";

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

const userSchema = new mongoose.Schema<UserDoc>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
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
