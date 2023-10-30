import jwt from "jsonwebtoken";
import { CustomError } from "../../helpers/error/CustomError.js";
import User from "../../models/User.js";

const getAccessToRoute = async (req, res, next) => {
  const token = await req.cookies.accessToken;
  const { JWT_SECRET_KEY } = process.env;
  if (!token) {
    return next(
      new CustomError("You are not authorized to access this route"),
      401
    );
  }

  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(
        new CustomError("You are not authorized to access this route", 401)
      );
    }
    req.user = {
      id: decoded.id,
    };
    next();
  });
};

const getAdminAccess = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (user.role !== "admin") {
    return next(new CustomError("Only admins can access this route", 403));
  }

  next();
};

export { getAccessToRoute, getAdminAccess };
