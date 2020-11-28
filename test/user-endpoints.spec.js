const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const authRouter = require("../src/auth/auth-router");
const { makeActivitiesArr } = require("./activities.fixtures");
const { makeCategoriesArr } = require("./categories.fixtures");
const { makeUsersArr } = require("./users.fixtures");

const testUsers = makeUsersArr();
const testCategories = makeCategoriesArr();
const testActivities = makeActivitiesArr();

describe("User endpoints", () => {
  let db;
  let authToken;

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

  describe("GET /api/users", () => {
    context("given there are users in the db", () => {
      let user = {
        email: "testuser@test.com",
        password: "best passphrase ever ever",
      };
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });
      beforeEach("insert activities", () => {
        return db.into("activities").insert(testActivities);
      });
      beforeEach("register and login", () => {
        return supertest(app)
          .post("/api/users")
          .send(user)
          .then((res) => {
            console.log("POST users response: ", res.body);
            return supertest(app)
              .post("/api/auth/login")
              .send(user)
              .then((res2) => {
                authToken = res2.body.authToken;
                console.log("POST login response: ", res.body);
              });
          });
      });

      it("if authtoken is valid, it returns the user", () => {
        return supertest(app)
          .get("/api/users")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200);
      });
    });
  });
});
