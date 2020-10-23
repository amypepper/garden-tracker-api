function makeActivitiesArr() {
  return [
    {
      id: 1,
      title: "watered brussels sprouts",
      datecompleted: "2020-10-18",
      timecompleted: "",
      datecreated: new Date().toISOString(),
      notes: "Watered lightly because it is supposed to rain tonight",
      categoryid: 3,
      userid: 1,
    },
    {
      id: 2,
      title: "weeded raspberry bushes",
      datecompleted: "2020-10-18",
      timecompleted: "",
      datecreated: new Date().toISOString(),
      notes: "",
      categoryid: 1,
      userid: 2,
    },
    {
      id: 3,
      title: "mulched garden beds",
      datecompleted: "2020-10-18",
      timecompleted: "",
      datecreated: new Date().toISOString(),
      notes: "",
      categoryid: 2,
      userid: 3,
    },
    {
      id: 4,
      title: "watered lavender",
      datecompleted: "2020-10-18",
      timecompleted: "",
      datecreated: new Date().toISOString(),
      notes: "",
      categoryid: 3,
      userid: 1,
    },
  ];
}

module.exports = { makeActivitiesArr };
