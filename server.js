const express = require("express");
require("dotenv").config();
require("./config/dbConnect");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const commentRouter = require("./routes/commentRoutes");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const notFoundMiddleware = require("./middlewares/not-found");

const app = express();

//-------------------------
//middlewares
//-------------------------
app.use(express.json());
app.use(cookieParser(process.env.JWT_KEY));

//-------------------------
//routes
//-------------------------

//user route
app.use("/api/v1/users", userRouter);
//post route
app.use("/api/v1/posts", postRouter);
//category route
app.use("/api/v1/categories", categoryRouter);
//comment route
app.use("/api/v1/comments", commentRouter);

//------------------------------
//Error handlers middleware
//------------------------------

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

//-----------------------------
//listen to server
//-----------------------------

const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server is up and running on ${PORT}...`));
