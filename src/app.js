require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV, CLIENT_ORIGIN, PORT } = require("./config");
const app = express();
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
const path = require("path");
const { v4: uuid } = require("uuid");

///////////////////// DUMMY DATA /////////////////////

app.use(express.json());
app.use(morgan(morganOption));
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

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
app.get(`/api/users`, (req, res, next) => {
  res.json(users).next();
});

app.post("/api/users", (req, res, next) => {
  const { email, password } = req.body;

  const prohibitedChars = /(\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\""|\;|\: | \d | \t | [0-9])/;
  const properShape = /[a-z]+ [a-z]+ [a-z]+/;

  if (!email || !password) {
    return res.status(400).send("Both email and password are required");
  }
  if (!email.match(/@.+\.[a-z]/)) {
    return res.status(400).send("Invalid email address");
  }
  if (password.length < 9 || password.length > 40) {
    return res
      .status(400)
      .send("Passphrase must be between 9 and 40 characters");
  }
  if (password.match(prohibitedChars)) {
    return res
      .status(400)
      .send("Passphrase should contain only letters and spaces");
  }
  if (!password.match(properShape)) {
    return res.status(400).send("Passphrase must contain at least 3 words");
  }
  const id = uuid();
  const newUser = {
    id,
    email,
    password,
  };
  const index = users.length;
  users.splice(index, 0, newUser);

  res
    .status(201)
    .location(path.posix.join(req.originalUrl, `/${id}`))
    .send(`User with id ${id} created`);
  next();
});

app.delete("/api/users/:userid", (req, res, next) => {
  const id = req.params.userid;
  const targetUser = users.find((user) => user.id === id);

  if (!targetUser) {
    res.status(400).send("Could not find that user id");
  }
  const targetUserIndex = users.indexOf(targetUser);

  users.splice(targetUserIndex, 1);

  res.status(204).send(`User with id ${id} deleted`);
  next();
});

// app.patch("/api/users/:userid", (req, res, next) => {
//   const id = req.params.userid;
//   const targetUser = users.find((user) => user.id === id);
//   const {}
//   if (!targetUser) {
//     res.status(400).send("Could not find that user id");
//   }
//   const targetUserIndex = users.indexOf(targetUser);

//   users.splice(targetUserIndex, 1);

//   res.status(204).send(`User with id ${id} deleted`);
//   next();

// });

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
