const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeActivitiesArr } = require("./activities.fixtures");
const { makeCategoriesArr } = require("./categories.fixtures");
const { makeUsersArr } = require("./users.fixtures");

describe.only("Activities Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  beforeEach("clean the table", () =>
    db.raw(
      "TRUNCATE TABLE users, categories, activities RESTART IDENTITY CASCADE"
    )
  );

  describe("GET /api/activities", () => {
    context("Given there are activities in the db", () => {
      const testUsers = makeUsersArr();
      const testCategories = makeCategoriesArr();
      const testActivities = makeActivitiesArr();

      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });
      beforeEach("insert activities", () => {
        return db.into("activities").insert(testActivities);
      });

      it("responds with 200 and all of the activities", () => {
        return supertest(app)
          .get("/api/activities")
          .expect(200, testActivities);
        // TODO: add more assertions about the body
      });
    });

    context(`Given no articles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/activities").expect(200, []);
      });
    });

    describe("POST /api/activities", () => {
      const testUsers = makeUsersArr();
      const testCategories = makeCategoriesArr();

      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });

      it("creates an activity and responds with 201 and a confirmation message", () => {
        return supertest(app)
          .post("/api/activities")
          .send({
            title: "test756",
            datecompleted: "2020-10-17",
            timecompleted: "afternoon",
            notes: "",
            categoryid: 2,
            userid: 1,
          })
          .expect(201);
      });
    });
  });

  describe("GET /api/activities/:activityid", () => {
    context("Given there are activities in the db", () => {
      const testUsers = makeUsersArr();
      const testCategories = makeCategoriesArr();
      const testActivities = makeActivitiesArr();
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });
      beforeEach("insert activities", () => {
        return db.into("activities").insert(testActivities);
      });

      it("responds with 200 and the activity with the specified id", () => {
        const activityId = 3;
        const expectedActivity = testActivities[activityId - 1];
        return supertest(app)
          .get(`/api/activities/${activityId}`)
          .expect(200, expectedActivity);
      });
    });

    context("Given no activities", () => {
      it("responds with 404", () => {
        const activityId = 2;
        return supertest(app)
          .get(`/api/activities/${activityId}`)
          .expect(404, { error: { message: "Activity does not exist." } });
      });
    });
  });
});
