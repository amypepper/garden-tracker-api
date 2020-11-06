const { expect } = require("chai");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const { makeActivitiesArr } = require("./activities.fixtures");
const { makeCategoriesArr } = require("./categories.fixtures");
const { makeUsersArr } = require("./users.fixtures");

describe("Categories Endpoints", function () {
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
    let user = { email: "testuser@test.com", password: "P@ssword1234" };
    return supertest(app)
      .post("/api/users")
      .send(user)
      .then((res) => {
        console.log(user);
        return supertest(app)
          .post("/api/auth/login")
          .send(user)
          .then((res2) => {
            authToken = res2.body.authToken;
          });
      });
  });

  after("disconnect from db", () => db.destroy());

  describe("GET /api/categories", () => {
    context("Given there are categories in the db", () => {
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

      it("responds with 200 and all of the categories", () => {
        return supertest(app)
          .get("/api/categories")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.map((obj) => obj.title)).to.eql(
              testCategories.map((category) => category.title)
            );
          });
      });
    });
    context(`Given no categories`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/categories")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, []);
      });
    });
  });

  describe("POST /api/categories", () => {
    const testUsers = makeUsersArr();

    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });

    it("creates a category and responds with 201 and the object", () => {
      const newCategory = {
        title: "Test645",
        userid: 1,
      };

      return supertest(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newCategory)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newCategory.title);
          expect(res.body.userid).to.eql(newCategory.userid);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/categories/${res.body.id}`);
          const expected = new Date().toLocaleString();
          const actual = new Date(res.body.datecreated).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then((postRes) => {
          supertest(app)
            .get(`/api/categories/${postRes.body.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(postRes.body);
        });
    });
  });

  describe("GET /api/categories/:categoryid", () => {
    context("Given there are categories in the db", () => {
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

      it("responds with 200 and the category with the specified id", () => {
        const categoryId = 3;
        const expectedCategory = testCategories[categoryId - 1];
        return supertest(app)
          .get(`/api/categories/${categoryId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200, expectedCategory);
      });
    });

    context("Given no categories", () => {
      it("responds with 404", () => {
        const categoryId = 2;
        return supertest(app)
          .get(`/api/categories/${categoryId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: "Category does not exist." } });
      });
    });
  });

  describe("DELETE /api/categories/:categoryid", () => {
    context(`Given no categories`, () => {
      it(`responds with 404`, () => {
        const categoryId = 123456;
        return supertest(app)
          .delete(`/api/categories/${categoryId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404, { error: { message: `Category does not exist.` } });
      });
    });

    context("Given there are categories in the db", () => {
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

      it("responds with 204 and deletes the category", () => {
        const idToDelete = 2;
        const expectedCategories = testCategories.filter(
          (category) => category.id !== idToDelete
        );
        return supertest(app)
          .delete(`/api/categories/${idToDelete}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/categories/`)
              .set("Authorization", `Bearer ${authToken}`)
              .expect(expectedCategories)
          );
      });
    });
  });
});
