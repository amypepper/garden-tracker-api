const express = require("express");
const path = require("path");
const xss = require("xss");
const activitiesRouter = express.Router();
const activitiesService = require("./activities-service");

const { requireAuth } = require("../middleware/jwt-auth");

const serializeActivity = (activity) => {
  const sanitizedDate = xss(activity.datecompleted);
  const dateString = new Date(sanitizedDate);

  return {
    id: activity.id,
    title: xss(activity.title),
    datecompleted: dateString.toISOString().substring(0, 10),
    timecompleted: xss(activity.timecompleted),
    notes: xss(activity.notes),
    datecreated: activity.datecreated,
    categoryid: Number(activity.categoryid),
    userid: activity.userid,
  };
};
let knexInstance;
let currentId;

function validateDataTypes(activity, res) {
  if (!Number.isInteger(activity.categoryid)) {
    return res.status(400).json({
      error: { message: "Category id must be an integer" },
    });
  }
  if (typeof activity.title !== "string") {
    return res.status(400).json({
      error: { message: "The activity's title must be a string." },
    });
  }

  if (typeof activity.datecompleted !== "string") {
    return res.status(400).json({
      error: { message: "The activity's date must be a string." },
    });
  }
  if (typeof activity.timecompleted !== "string") {
    return res.status(400).json({
      error: { message: "The activity's time must be a string." },
    });
  }
  if (typeof activity.notes !== "string") {
    return res.status(400).json({
      error: { message: "The activity's notes entry must be a string." },
    });
  }
  return null;
}

activitiesRouter
  .route("/api/activities")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    next();
  })
  .all(requireAuth)
  .get((req, res, next) => {
    activitiesService
      .getAllActivitiesByUser(knexInstance, req.user.id)
      .then((activities) => res.json(activities.map(serializeActivity)))
      .catch(next);
  })
  .post((req, res, next) => {
    const { title, datecompleted, timecompleted, notes, categoryid } = req.body;

    const newActivity = {
      title,
      datecompleted,
      timecompleted,
      notes,
      categoryid: Number(categoryid),
      userid: req.user.id,
    };

    if (!title) {
      return res.status(400).json({
        error: { message: `Missing title in request body` },
      });
    }
    if (!datecompleted) {
      return res.status(400).json({
        error: { message: `Missing date in request body` },
      });
    }
    if (!req.user.id) {
      return res.status(400).json({
        error: { message: `Missing user id in request body` },
      });
    }

    validateDataTypes(newActivity, res);

    activitiesService
      .insertActivity(knexInstance, newActivity)
      .then((activity) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${activity.id}`))
          .json(activity);
      })
      .catch(next);
  });

/**************************  ACTIVITYID ENDPOINTS **************************/

activitiesRouter
  .route("/api/activities/:activityid")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    currentId = Number(req.params.activityid);

    activitiesService
      .getActivityById(knexInstance, currentId)
      .then((activity) => {
        if (!activity) {
          return res.status(404).json({
            error: { message: "Activity does not exist." },
          });
        }
        req.activity = serializeActivity(activity);
        next();
      })
      .catch(next);
  })
  .all(requireAuth)
  .get((req, res) => {
    return res.json(req.activity);
  })
  .delete((req, res, next) => {
    activitiesService
      .deleteActivity(knexInstance, currentId)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = activitiesRouter;
