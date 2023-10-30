import { sendJwtToClient } from "../helpers/token/tokenHelper.js";
import { CustomError } from "../helpers/error/CustomError.js";
import User from "../models/User.js";
import {
  validateUserInput,
  comparePassword,
} from "../helpers/input/inputHelper.js";

const signup = async (req, res, next) => {
  const { username } = req.body;
  try {
    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      return next(new CustomError("This username is already in use", 400));
    }

    const user = await User.create(req.body);

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Signup Successfull",
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!validateUserInput(username, password)) {
    return next(new CustomError("Please check your inputs", 400));
  }
  const user = await User.findOne({ username }).select("+password");

  if (!comparePassword(password, user.password)) {
    return next(new CustomError("Please check your credentials", 400));
  }

  user.status = "online";
  await user.save();

  sendJwtToClient(user, res);
};

const logout = async (req, res, next) => {
  return res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

export { signup, login, logout };
