const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeActivitiesArr } = require("./activities.fixtures");
const { makeCategoriesArr } = require("./categories.fixtures");
const { makeUsersArr } = require("./users.fixtures");

const testUsers = makeUsersArr();
const testCategories = makeCategoriesArr();
const testActivities = makeActivitiesArr();

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

  beforeEach("register", () => {
    let user = {
      email: "testuser@test.com",
      password: "best passphrase ever ever",
    };
    return supertest(app)
      .post("/api/users")
      .send(user)
      .then((res) => {
        user = res.body.user;
      });
  });
  after("disconnect from db", () => db.destroy());

  describe("POST /login", () => {
    context("given there are users in the db", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });
      beforeEach("insert activities", () => {
        return db.into("activities").insert(testActivities);
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

      it("if user is valid, it encrypts/compares the password and creates auth token", () => {
        let user = {
          email: "testuser@test.com",
          password: "best passphrase ever ever",
        };
        return supertest(app)
          .post("/api/auth/login")
          .send(user)
          .expect((res) => {
            expect(res.body.authToken);
          });
      });
    });
  });
});
