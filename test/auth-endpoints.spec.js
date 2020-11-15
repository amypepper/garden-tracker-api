const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { makeActivitiesArr } = require("./activities.fixtures");
const { makeCategoriesArr } = require("./categories.fixtures");
const { makeUsersArr } = require("./users.fixtures");

const testUsers = makeUsersArr();
const testCategories = makeCategoriesArr();
const testActivities = makeActivitiesArr();

const testUser = testUsers[0];

describe("Auth endpoints", () => {
  let db;
  let user;

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

  // beforeEach("register", () => {
  //   user = {
  //     email: "testuser@test.com",
  //     password: "best passphrase ever ever",
  //   };
  //   return supertest(app)
  //     .post("/api/users")
  //     .send(user)
  //     .then((res) => {
  //       user = res.body.user;
  //     });
  // });
  after("disconnect from db", () => db.destroy());

  describe("POST /login", () => {
    context("given there are users in the db", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });

      it('returns 400 and "Incorrect email or password" when user not found', () => {
        const badUser = {
          email: "idonotexist@yahoo.com",
          password: "the worst passphrase",
        };
        return supertest(app)
          .post("/api/auth/login")
          .send(badUser)
          .expect(400, { error: "Incorrect email or password" });
      });

      it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
        const hashedPass = bcrypt.hash(testUser.password, 12);
        const userValidCreds = {
          email: testUser.email,
          password: hashedPass,
        };
        const expectedToken = jwt.sign(
          { user_id: testUser.id }, // payload
          process.env.JWT_SECRET,
          {
            subject: "testuser@test.com",
            algorithm: "HS256",
          }
        );

        return supertest(app)
          .post("/api/auth/login")
          .send(userValidCreds)
          .expect(200, {
            authToken: expectedToken,
          });
      });
    });
  });
});
