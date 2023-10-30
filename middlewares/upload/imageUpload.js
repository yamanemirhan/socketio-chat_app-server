import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { CustomError } from "../../helpers/error/CustomError.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const rootDir = path.dirname(require.main.filename);
    cb(null, path.join(rootDir, "public/images"));
  },
  filename: function (req, file, cb) {
    const randomId = uuidv4();
    const extension = file.mimetype.split("/")[1];
    req.savedImage =
      file.fieldname === "message_image"
        ? "message_" + randomId + "." + extension
        : "user_" + req.user.id + "_" + randomId + "." + extension;
    cb(null, req.savedImage);
  },
});
const fileFilter = (req, file, cb) => {
  let allowedMimeTypes = ["image/jpg", "image/gif", "image/jpeg", "image/png"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new CustomError("Please provide a valid image file", 400), false);
  }
  return cb(null, true);
};

const imageUpload = multer({ storage, fileFilter });

export { imageUpload };
