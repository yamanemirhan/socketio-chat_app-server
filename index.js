import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { connectDB } from "./utils/connectDB.js";
import { customErrorHandler } from "./middlewares/error/customErrorHandler.js";
import { mainRouter } from "./routes/index.js";
import Message from "./models/Message.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

// Header
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://socketio-chatting.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// MIDDLEWARES
app.use(express.json());
app.use(express.static("public"));

// ROUTES
app.use("/api", mainRouter);
app.use(customErrorHandler);

// CONNECT DB AND LISTEN PORT
connectDB();
const PORT = process.env.PORT || 4000;
const expressServer = app.listen(
  PORT,
  console.log(`Listening on PORT: ${PORT}`)
);

// SOCKET IO
const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
  },
});

const rooms = ["Technology", "Coding", "Game", "Finance", "Movies"];

async function getLastMessagesFromRoom(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return roomMessages;
}

function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

// socket connection
io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    const members = await User.find();
    io.emit("new-user", members);
  });

  socket.on("join-room", async (newRoom, previousRoom) => {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit("room-messages", roomMessages);
  });

  socket.on("message-room", async (room, content, sender, time, date) => {
    const newMessage = await Message.create({
      content,
      from: sender,
      time,
      date,
      to: room,
    });
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    // sending message to room
    io.to(room).emit("room-messages", roomMessages);
    socket.broadcast.emit("notifications", room);
  });

  app.delete("/logout", async (req, res) => {
    try {
      const { data } = req.body;
      const user = await User.findOne({ username: data.username });
      user.status = "offline";
      user.newMessages = data.newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit("new-user", members);
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(400).send();
    }
  });
});

app.get("/rooms", (req, res) => {
  res.json(rooms);
});
