const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const config = require("../src/config");
const { makeUsersArr } = require("./users.fixtures");
const bcrypt = require("bcryptjs");
const { hashPassword } = require("../src/users/users-service");

const testUsers = makeUsersArr();

describe("Auth endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  beforeEach("clean the tables", () =>
    db.raw(
      "TRUNCATE TABLE users, categories, activities RESTART IDENTITY CASCADE"
    )
  );

  after("disconnect from db", () => db.destroy());

  describe("POST /login", () => {
    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });

    it('returns 400 and "Incorrect email or password" when user not found', () => {
      const badUser = {
        email: "idonotexist@test.com",
        password: "the worst passphrase",
      };
      return supertest(app)
        .post("/api/auth/login")
        .send(badUser)
        .expect(400, { error: "Incorrect email or password" });
    });

    it(`responds with JWT using secret when credentials valid`, () => {
      const userValidCreds = {
        email: "test1@test.com",
        password: "opera test purple",
      };

      const expectedToken = jwt.sign({ user_id: 1 }, config.JWT_SECRET, {
        subject: userValidCreds.email,
        algorithm: "HS256",
      });

      return supertest(app)
        .post("/api/auth/login")
        .send(userValidCreds)
        .expect({
          authToken: expectedToken,
        });
    });
  });
});
