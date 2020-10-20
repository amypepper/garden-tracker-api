const express = require("express");
const path = require("path");
const xss = require("xss");
const activitiesRouter = express.Router();
const jsonParser = express.json();
const activitiesService = require("./activities-service");

const serializeActivity = (activity) => {
  const sanitizedDate = xss(activity.datecompleted);
  console.log(sanitizedDate);
  const dateString = new Date(sanitizedDate);

  return {
    id: activity.id,
    title: xss(activity.title),
    datecompleted: dateString.toISOString().substring(0, 10),
    timecompleted: xss(activity.timecompleted),
    notes: xss(activity.notes),
    datecreated: activity.datecreated,
    categoryid: activity.categoryid,
    userid: activity.userid,
  };
};
let knexInstance;
let currentId;

function validateDataTypes(activity, res) {
  if (!Number.isInteger(activity.userid)) {
    return res.status(400).json({
      error: { message: "User id must be an integer" },
    });
  }
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
  .get((req, res, next) => {
    activitiesService
      .getAllActivities(knexInstance)
      .then((activities) => res.json(activities.map(serializeActivity)))
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const {
      title,
      datecompleted,
      timecompleted,
      notes,
      categoryid,
      userid,
    } = req.body;

    const newActivity = {
      title,
      datecompleted,
      timecompleted,
      notes,
      categoryid,
      userid,
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
    if (!userid) {
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
          .send(`Activity with id ${activity.id} created`);
      })
      .catch(next);
  });

/**************************  ACTIVITYID ENDPOINTS **************************/

activitiesRouter
  .route("/api/activities/:activityid")
  .all((req, res, next) => {
    knexInstance = req.app.get("db");
    currentId = parseInt(req.params.activityid);

    if (!Number.isInteger(currentId)) {
      return res.status(400).send("The activity id must be a number.");
    }

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
  .get((req, res) => {
    return res.json(req.activity);
  })
  .delete(jsonParser, (req, res, next) => {
    if (!Number.isInteger(currentId)) {
      return res.status(400).send("The activity id must be a number.");
    }

    activitiesService
      .deleteActivity(knexInstance, currentId)
      .then(() => {
        return res.status(204).end();
      })
      .catch(next);
  });

module.exports = activitiesRouter;
