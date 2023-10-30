import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide a email"],
      match: [
        /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Please provide a password at least 6 characters"],
      select: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    newMessages: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      default: "online",
    },
  },
  { timestamps: true }
);

UserSchema.methods.generateJwtFromUser = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;
  const payload = {
    id: this._id,
  };

  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const saltRounds = 10;
  const myPlaintextPassword = this.password;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});

export default mongoose.model("User", UserSchema);
