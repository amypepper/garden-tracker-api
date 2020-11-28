const categoriesService = {
  getAllCategoriesByUser(knex, userid) {
    return knex.select("*").from("categories").where("userid", userid);
  },

  getCategoryById(knex, id) {
    return knex.select("*").from("categories").where("id", id).first();
  },

  insertCategory(knex, newCategory) {
    return knex
      .insert(newCategory)
      .into("categories")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  deleteCategory(knex, id) {
    return knex("categories").where("id", id).del();
  },
};

module.exports = categoriesService;
