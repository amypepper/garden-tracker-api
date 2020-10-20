const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const makeActivitiesArr = require("./activities.fixtures");

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

  before("clean the table", () =>
    db.raw("TRUNCATE TABLE activities RESTART IDENTITY CASCADE")
  );

  context("Given there are activities in the db", () => {
    const testActivities = makeActivitiesArr();
    beforeEach("insert activities", () => {
      return db.into("activities").insert(testActivities);
    });

    it("GET /api/activities responds with 200 and all of the activities", () => {
      return supertest(app).get("/api/activities").expect(200, testActivities);
      // TODO: add more assertions about the body
    });
  });
});
