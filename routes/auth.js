import express from "express";

import { signup, login, logout } from "../controllers/auth.js";
import { getAccessToRoute } from "../middlewares/authorization/auth.js";
import { checkUsernameExists } from "../middlewares/database/databaseErrorHelper.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", checkUsernameExists, login);
authRouter.get("/logout", getAccessToRoute, logout);

export { authRouter };
