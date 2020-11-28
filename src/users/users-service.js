const bcrypt = require("bcryptjs");

const UsersService = {
  hasUserWithEmail(knex, email) {
    return knex("users")
      .where({ email })
      .first()
      .then((user) => !!user);
  },
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into("users")
      .returning("*")
      .then((rows) => rows[0]);
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  getAllUsers(knex) {
    return knex("users").select("*");
  },
};

bcrypt
  .hash("test test one", 12)
  .then((hash) => console.log("test test one ", hash));
bcrypt.hash("test test two", 12).then((hash) => console.log(hash));
bcrypt.hash("test test three", 12).then((hash) => console.log(hash));

module.exports = UsersService;
