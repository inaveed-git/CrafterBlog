import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/DBconnect.js";
import userRoutes from "./routers/user.router.js";
import authRoutes from "./routers/auth.router.js";
import postRoutes from "./routers/post.route.js";
import commentRoutes from "./routers/comment.route.js";
import cookieParser from "cookie-parser";

import ErrorHandler, { errorMidleWare } from "./utils/error.js";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

app.listen(PORT, () => {
  console.log(`The server is listening on port ${PORT}`);
});

app.all("*", (req, res, next) => {
  next(new ErrorHandler("Page not found ", 404));
});

app.use(errorMidleWare);
