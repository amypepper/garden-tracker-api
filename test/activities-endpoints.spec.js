const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeActivitiesArr } = require("./activities.fixtures");
const { makeCategoriesArr } = require("./categories.fixtures");
const { makeUsersArr } = require("./users.fixtures");

const testUsers = makeUsersArr();
const testCategories = makeCategoriesArr();
const testActivities = makeActivitiesArr();

describe("Activities Endpoints", function () {
  let db;
  let authToken;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  beforeEach("clean the table", () =>
    db.raw(
      "TRUNCATE TABLE users, categories, activities RESTART IDENTITY CASCADE"
    )
  );

  beforeEach("register and login", () => {
    let user = {
      email: "testuser@test.com",
      password: "best passphrase ever ever",
    };
    return supertest(app)
      .post("/api/users")
      .send(user)
      .then((res) => {
        return supertest(app)
          .post("/api/auth/login")
          .send(user)
          .then((res2) => {
            authToken = res2.body.authToken;
          });
      });
  });

  after("disconnect from db", () => db.destroy());

  describe("GET /api/activities", () => {
    context("Given there are activities in the db", () => {
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
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, testActivities);
      });
    });

    context(`Given no activities`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/activities")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, []);
      });
    });

    describe("POST /api/activities", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });

      it("creates an activity and responds with 201 and the object", () => {
        const newActivity = {
          title: "test756",
          datecompleted: "2020-10-17",
          timecompleted: "afternoon",
          notes: "",
          categoryid: 2,
          userid: 1,
        };

        return supertest(app)
          .post("/api/activities")
          .send(newActivity)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).to.eql(newActivity.title);
            expect(
              new Date(res.body.datecompleted).toISOString().substring(0, 10)
            ).to.eql(newActivity.datecompleted);
            expect(res.body.timecompleted).to.eql(newActivity.timecompleted);
            expect(res.body.notes).to.eql(newActivity.notes);
            expect(res.body.categoryid).to.eql(newActivity.categoryid);
            expect(res.body.userid).to.eql(newActivity.userid);
            expect(res.body).to.have.property("id");
            expect(res.headers.location).to.eql(
              `/api/activities/${res.body.id}`
            );
            const expected = new Date().toLocaleString();
            const actual = new Date(res.body.datecreated).toLocaleString();
            expect(actual).to.eql(expected);
          })
          .then((postRes) => {
            supertest(app)
              .get(`/api/activities/${postRes.body.id}`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(postRes.body);
          });
      });
    });
  });

  describe("GET /api/activities/:activityid", () => {
    context("Given there are activities in the db", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });
      beforeEach("insert activities", () => {
        return db.into("activities").insert(testActivities);
      });

      it(`responds with 401 'Missing bearer token' when no token`, () => {
        return supertest(app)
          .get(`/api/activities/2`)
          .expect(401, { error: `Missing bearer token` });
      });

      it("responds with 200 and the activity with the specified id", () => {
        const activityId = 3;
        const expectedActivity = testActivities[activityId - 1];
        return supertest(app)
          .get(`/api/activities/${activityId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, expectedActivity);
      });
    });

    context("Given no activities", () => {
      it("responds with 404", () => {
        const activityId = 2;
        return supertest(app)
          .get(`/api/activities/${activityId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: "Activity does not exist." } });
      });
    });
  });

  describe("DELETE /api/activities/:activityid", () => {
    context(`Given no activities`, () => {
      it(`responds with 404`, () => {
        const activityId = 123456;
        return supertest(app)
          .delete(`/api/activities/${activityId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Activity does not exist.` } });
      });
    });

    context("Given there are activities in the db", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert categories", () => {
        return db.into("categories").insert(testCategories);
      });
      beforeEach("insert activities", () => {
        return db.into("activities").insert(testActivities);
      });

      it("responds with 204 and deletes the activity", () => {
        const idToDelete = 4;
        const expectedActivities = testActivities.filter(
          (activity) => activity.id !== idToDelete
        );
        return supertest(app)
          .delete(`/api/activities/${idToDelete}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(204)
          .then((res) => {
            supertest(app)
              .get(`/api/activities/`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedActivities);
          });
      });
    });
  });
});
