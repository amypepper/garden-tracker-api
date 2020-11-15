const seedTestUsers = (knex, testData) => {
  return knex.into("users").insert(testData);
};
const seedTestCategories = (knex, testData) => {
  return knex.into("categories").insert(testData);
};
const seedTestActivities = (knex, testData) => {
  return knex.into("activities").insert(testData);
};

module.exports = {
  seedTestUsers,
  seedTestCategories,
  seedTestActivities,
};
