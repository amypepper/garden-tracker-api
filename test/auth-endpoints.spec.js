const knex = require("knex");
const app = require("../src/app");
const { makeUsersArr } = require("./users.fixtures");

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

    it('returns and "Incorrect email or password" 400 when password is invalid', () => {
      const badPassword = "this will not work";
      const goodUserBadPw = {
        email: testUsers[0].email,
        password: badPassword,
      };
      return supertest(app)
        .post("/api/auth/login")
        .send(goodUserBadPw)
        .expect(400, { error: "Incorrect email or password" });
    });

    it(`responds with JWT using secret when credentials valid`, () => {
      const userValidCreds = {
        email: testUsers[0].email,
        password: "opera test purple",
      };

      return supertest(app)
        .post("/api/auth/login")
        .send(userValidCreds)
        .expect((res) => {
          expect(res.body.authToken).to.exist;
        });
    });
  });
});
