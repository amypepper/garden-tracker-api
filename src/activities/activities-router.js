const express = require("express");
const path = require("path");
const xss = require("xss");
const activitiesRouter = express.Router();
const jsonParser = express.json();
const activitiesService = require("./activities-service");

const serializeActivity = (activity) => ({
  id: activity.id,
  title: xss(activity.title),
  datecompleted: xss(activity.datecompleted),
  timecompleted: xss(activity.timecompleted),
  notes: xss(activity.notes),
  datecreated: activity.datecreated,
  categoryid: activity.categoryid,
  userid: activity.userid,
});

activitiesRouter
  .route("/api/activities")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    activitiesService
      .getAllActivities(knexInstance)
      .then((activities) => res.json(activities.map(serializeActivity)))
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
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

    const validationArray = [title, datecompleted, userid];

    for (const input of validationArray) {
      if (!input) {
        return res.status(400).json({
          error: { message: `Missing ${input} in request body` },
        });
      }
    }
    // if (!title) {
    //   return res.status(400).json({
    //     error: { message: `Missing title in request body` },
    //   });
    // }
    // if (!datecompleted) {
    //   return res.status(400).json({
    //     error: { message: `Missing date in request body` },
    //   });
    // }
    // if (!userid) {
    //   return res.status(400).json({
    //     error: { message: `Missing user id in request body` },
    //   });
    // }
    if (!Number.isInteger(userid)) {
      return res.status(400).json({
        error: { message: "User id must be an integer" },
      });
    }

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

module.exports = activitiesRouter;
