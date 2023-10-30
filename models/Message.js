import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: String,
  from: Object,
  to: String,
  socketid: String,
  time: String,
  date: String,
});

export default mongoose.model("Message", MessageSchema);
