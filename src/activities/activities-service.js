const knex = require("knex");

const activitiesService = {
  getAllActivitiesByUser(knex, userid) {
    return knex.select("*").from("activities").where("userid", userid);
  },

  getActivityById(knex, id) {
    return knex.select("*").from("activities").where("id", id).first();
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

  deleteActivity(knex, id) {
    return knex("activities").where("id", id).del();
  },
};

module.exports = activitiesService;
