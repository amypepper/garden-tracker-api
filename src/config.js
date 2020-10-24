module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN:
    "https://garden-tracker-client.vercel.app/" || "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://postgres@localhost/gardentracker",
};
