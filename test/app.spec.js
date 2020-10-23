const app = require("../src/app");

describe.skip("App", () => {
  it.skip("GET /api/* responds with 200 and something", () => {
    return supertest(app).get("/api/activities").expect(200);
  });
});
