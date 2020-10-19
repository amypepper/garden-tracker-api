const app = require("../src/app");

describe("App", () => {
  it("GET /api/* responds with 200 and something", () => {
    return supertest(app).get("/api/activities").expect(200, "something");
  });
});
