const express = require("express");
const path = require("path");
const xss = require("xss");
const { requireAuth } = require("../middleware/jwt-auth");
const categoriesRouter = express.Router();
const categoriesService = require("./categories-service");

const serializeCategory = (category) => {
  return {
    id: category.id,
    title: xss(category.title),
    datecreated: category.datecreated,
    userid: category.userid,
  };
};
let knexInstance;
let currentId;

function validateDataTypes(category, res) {
  if (typeof category.title !== "string") {
    return res.status(400).json({
      error: { message: "The category's title must be a string." },
    });
  }
  return null;
}

categoriesRouter
  .route("/api/categories")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    next();
  })
  .all(requireAuth)
  .get((req, res, next) => {
    categoriesService
      .getAllCategories(knexInstance)
      .then((categories) => res.json(categories.map(serializeCategory)))
      .catch(next);
  })
  .post((req, res, next) => {
    const { title, userid } = req.body;

    const newCategory = {
      title,
      userid,
    };

    if (!title) {
      return res.status(400).json({
        error: { message: `Missing title in request body` },
      });
    }
    if (!userid) {
      return res.status(400).json({
        error: { message: `Missing user id in request body` },
      });
    }

    validateDataTypes(newCategory, res);

    categoriesService
      .insertCategory(knexInstance, newCategory)
      .then((category) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${category.id}`))
          .json(category);
      })
      .catch(next);
  });

/**************************  CATEGORYID ENDPOINTS **************************/

categoriesRouter
  .route("/api/categories/:categoryid")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    currentId = parseInt(req.params.categoryid);

    if (!Number.isInteger(currentId)) {
      return res.status(400).send("The category id must be a number.");
    }

    categoriesService
      .getCategoryById(knexInstance, currentId)
      .then((category) => {
        if (!category) {
          return res.status(404).json({
            error: { message: "Category does not exist." },
          });
        }
        req.category = serializeCategory(category);
        next();
      })
      .catch(next);
  })
  .all(requireAuth)
  .get((req, res) => {
    return res.json(req.category);
  })
  .delete((req, res, next) => {
    if (!Number.isInteger(currentId)) {
      return res.status(400).send("The category id must be a number.");
    }

    categoriesService
      .deleteCategory(knexInstance, currentId)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = categoriesRouter;
