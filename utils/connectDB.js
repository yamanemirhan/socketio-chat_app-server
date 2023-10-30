import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => {
      console.log("MongoDb Connection Successful");
    })
    .catch((err) => {
      console.error(err);
    });
};
