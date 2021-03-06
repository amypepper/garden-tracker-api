const express = require("express");
const xss = require("xss");
const usersRouter = express.Router();
const UsersService = require("./users-service");
const { requireAuth } = require("../middleware/jwt-auth");

const serializeUser = (user) => {
  return {
    id: user.id,
    email: xss(user.email),
    password: user.password,
    datecreated: user.datecreated,
  };
};
let knexInstance;

usersRouter
  .route("/api/users")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    next();
  })
  .get(requireAuth, (req, res) => {
    res.json(serializeUser(req.user));
  })
  .post((req, res) => {
    const { password, email } = req.body;
    const prohibitedChars = /(\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\"|\;|\:|\d|\t)/;
    const properShape = /[a-z][a-z][a-z]+ [a-z][a-z][a-z]+ [a-z][a-z][a-z]+/;

    for (const field of ["email", "password"]) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing ${field}`,
        });
      }
    }

    if (!email.match(/\@.+\.[a-z]/)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (password.match(prohibitedChars)) {
      return res
        .status(400)
        .json({ error: "Passphrase should contain only letters and spaces" });
    }
    if (!password.match(properShape)) {
      return res.status(400).json({
        error:
          "Passphrase must contain at least 3 words with a space between each",
      });
    }
    if (password.length < 11 || password.length > 40) {
      return res.status(400).json({
        error:
          "Passphrase must be between 11 and 40 characters (including spaces)",
      });
    }

    UsersService.hasUserWithEmail(knexInstance, email).then((hasUser) => {
      if (hasUser) {
        return res.status(400).json({
          error: `Email already used`,
        });
      }

      return UsersService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          email,
          password: hashedPassword,
        };

        return UsersService.insertUser(knexInstance, newUser).then((user) => {
          res.status(201).json(serializeUser(user));
        });
      });
    });
  });

module.exports = usersRouter;
