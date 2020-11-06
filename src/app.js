require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, CLIENT_ORIGIN } = require("./config");
const app = express();
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
const activitiesRouter = require("./activities/activities-router");
const categoriesRouter = require("./categories/categories-router");
const usersRouter = require("./users/users-router");
const authRouter = require("./auth/auth-router");

app.use(express.json());
app.use(morgan(morganOption));
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(activitiesRouter);
app.use(categoriesRouter);
app.use(usersRouter);
app.use("/api/auth", authRouter);

///////////////////// ERROR HANDLER /////////////////////
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
