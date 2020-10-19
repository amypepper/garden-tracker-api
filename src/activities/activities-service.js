const knex = require("knex");

const activitiesService = {
  getAllActivities(knex) {
    return knex.select("*").from("activities");
  },

  insertActivity(knex, newActivity) {
    return knex
      .insert(newActivity)
      .into("activities")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = activitiesService;
