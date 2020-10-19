const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");

describe.only("Activities Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABSE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("gardentracker_test").truncate());

  context("Given there are activities in the db", () => {
    const testActivities = [
      {
        id: 1,
        title: "watered brussels sprouts",
        datecompleted:
          "Mon Oct 05 2020 00:00:00 GMT-0700 (Pacific Daylight Time)",
        timecompleted: "",
        notes: "Watered lightly because it is supposed to rain tonight",
        datecreated: "2020-10-18T03:08:30.074Z",
        categoryid: 3,
        userid: 1,
      },
      {
        id: 2,
        title: "weeded raspberry bushes",
        datecompleted:
          "Thu Oct 01 2020 00:00:00 GMT-0700 (Pacific Daylight Time)",
        timecompleted: "",
        notes: "",
        datecreated: "2020-10-18T03:08:30.074Z",
        categoryid: 1,
        userid: 2,
      },
      {
        id: 3,
        title: "mulched garden beds",
        datecompleted:
          "Tue Sep 22 2020 00:00:00 GMT-0700 (Pacific Daylight Time)",
        timecompleted: "",
        notes: "",
        datecreated: "2020-10-18T03:08:30.074Z",
        categoryid: 2,
        userid: 3,
      },
      {
        id: 4,
        title: "watered lavender",
        datecompleted:
          "Wed Sep 30 2020 00:00:00 GMT-0700 (Pacific Daylight Time)",
        timecompleted: "",
        notes: "",
        datecreated: "2020-10-18T03:08:30.074Z",
        categoryid: 3,
        userid: 1,
      },
    ];

    beforeEach("insert activities", () => {
      return db.into("activities").insert(testActivities);
    });

    it("GET /api/activities responds with 200 and all of the activities", () => {
      return supertest(app).get("/api/activities").expect(200);
      // TODO: add more assertions about the body
    });
  });
});
