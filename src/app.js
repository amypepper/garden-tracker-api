require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, CLIENT_ORIGIN } = require("./config");
const app = express();
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
const activitiesRouter = require("./activities/activities-router");

///////////////////// DUMMY DATA /////////////////////

const users = [
  {
    id: "gawe987yaehgpiubrfta",
    email: "iamawesome@me.com",
    password: "best password ever",
  },
  {
    id: "piu9087uyh0on3497a",
    email: "thisisme@gmail.com",
    password: "super secret password",
  },
  {
    id: "poebfd739bng437ey",
    email: "whatsupbuttercup@gmail.com",
    password: "stapler weight puff baby",
  },
];

app.use(express.json());
app.use(morgan(morganOption));
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(activitiesRouter);

///////////////////// API KEY VALIDATION /////////////////////
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    console.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
});

/////////////////////  HOME ENDPOINT /////////////////////

/////////////////////  SIGNUP /////////////////////

/////////////////////  ACTIVITIES //////////////////////

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
