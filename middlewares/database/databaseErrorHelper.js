import { CustomError } from "../../helpers/error/CustomError.js";
import User from "../../models/User.js";

const checkUserExists = async (req, res, next) => {
  const id = req.params.id || req.query.id;
  const user = await User.findById({ _id: id });
  if (!user) {
    return next(new CustomError("User Not Found!", 500));
  }
  next();
};

const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body;
  const user = await User.findOne({
    username,
  });
  if (!user) return next(new CustomError("Invalid username or password", 400));

  next();
};

export { checkUserExists, checkUsernameExists };
